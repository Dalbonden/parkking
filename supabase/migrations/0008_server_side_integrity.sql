-- Security: the anon key is public, so any authenticated user can bypass the
-- Next.js server actions and write directly to PostgREST. Every invariant that
-- previously lived only in TypeScript is enforced here instead.
--
-- Confirmed exploitable before this migration (all reproduced against the live
-- DB in a rolled-back transaction):
--   1. Insert a booking with status='confirmed', payment_status='paid',
--      amount_total=1 — a free, fully confirmed booking, no Stripe involved.
--   2. UPDATE own listing: status->'active' (bypass moderation),
--      consent_verified->true (forge the right-to-sublet badge),
--      rating->5.0, review_count->412 (forge reputation).
--   3. UPDATE own profile: is_id_verified->true (0005 only covered id_status).

-- Privilege helper -----------------------------------------------------------
-- True for the service role and for direct database connections (migrations,
-- admin SQL). False for anon/authenticated PostgREST requests, i.e. browsers.
create or replace function public.is_privileged()
returns boolean language plpgsql stable set search_path = '' as $$
declare claims text := nullif(current_setting('request.jwt.claims', true), '');
begin
  if claims is null then return true; end if;
  return coalesce((claims::jsonb) ->> 'role', '') = 'service_role';
exception when others then return false;
end $$;
revoke execute on function public.is_privileged() from public;

-- Moderation flag: only the service role may approve a listing --------------
alter table public.listings
  add column if not exists moderation_approved boolean not null default false;

-- Existing live listings are already approved; keep them working.
update public.listings set moderation_approved = true where status = 'active';

-- 1. Bookings ---------------------------------------------------------------
-- The renter controls none of the money or state columns. Amounts are
-- recomputed from the listing price using the fee model in lib/payments.ts
-- (renter fee 8%); status/payment_status always start at requested/pending.
create or replace function public.enforce_booking_integrity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  l           public.listings%rowtype;
  months      int;
  rent        int;
  renter_fee  int;
begin
  if public.is_privileged() then
    return new;  -- Stripe webhook / admin acts through the service role
  end if;

  select * into l from public.listings where id = new.listing_id;
  if not found then
    raise exception 'Listing does not exist';
  end if;
  if l.status <> 'active' then
    raise exception 'Listing is not bookable';
  end if;
  if l.host_id = new.renter_id then
    raise exception 'You cannot book your own space';
  end if;

  if new.start_date < current_date - 1 then
    raise exception 'Start date cannot be in the past';
  end if;
  if new.end_date <= new.start_date then
    raise exception 'End date must be after the start date';
  end if;

  months := greatest(1, least(12,
    extract(year from age(new.end_date, new.start_date))::int * 12
    + extract(month from age(new.end_date, new.start_date))::int));

  rent       := l.price_per_month * months;
  renter_fee := round(rent * 0.08);

  -- Overwrite anything the client sent.
  new.amount_total   := rent + renter_fee;
  new.service_fee    := renter_fee;
  new.status         := 'requested';
  new.payment_status := 'pending';

  -- No overlapping live booking for the same space.
  if exists (
    select 1 from public.bookings b
    where b.listing_id = new.listing_id
      and b.status in ('confirmed', 'active')
      and b.start_date < new.end_date
      and new.start_date < b.end_date
  ) then
    raise exception 'That space is already booked for the selected period';
  end if;

  return new;
end $$;

drop trigger if exists enforce_booking_integrity on public.bookings;
create trigger enforce_booking_integrity
  before insert on public.bookings
  for each row execute function public.enforce_booking_integrity();

revoke execute on function public.enforce_booking_integrity() from public;

-- 2. Listings ---------------------------------------------------------------
-- Hosts own their content, never their moderation state or trust signals.
create or replace function public.protect_listing_fields()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_privileged() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status              := 'pending_review';
    new.moderation_approved := false;
    new.consent_verified    := false;
    new.rating              := 0;
    new.review_count        := 0;
    return new;
  end if;

  -- UPDATE: pin every field the host must not control.
  new.host_id             := old.host_id;
  new.moderation_approved := old.moderation_approved;
  new.consent_verified    := old.consent_verified;
  new.rating              := old.rating;
  new.review_count        := old.review_count;

  -- A host may pause/remove freely, but may only go live once approved.
  if new.status is distinct from old.status then
    if new.status = 'active' and not old.moderation_approved then
      new.status := old.status;
    elsif new.status = 'pending_review' and old.status = 'active' then
      new.status := old.status;  -- no re-queueing to dodge review history
    end if;
  end if;

  return new;
end $$;

drop trigger if exists protect_listing_fields on public.listings;
create trigger protect_listing_fields
  before insert or update on public.listings
  for each row execute function public.protect_listing_fields();

revoke execute on function public.protect_listing_fields() from public;

-- 3. Profiles ---------------------------------------------------------------
-- Extends 0005 (which only covered id_status) to the legacy verification flag
-- and to the Stripe payout fields, which only onboarding may set.
create or replace function public.protect_id_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_privileged() then
    return new;
  end if;

  new.id                := old.id;
  new.is_id_verified    := old.is_id_verified;
  new.stripe_account_id := old.stripe_account_id;
  new.payouts_enabled   := old.payouts_enabled;

  if new.id_status is distinct from old.id_status
     and new.id_status in ('verified', 'rejected') then
    new.id_status := old.id_status;  -- silently ignore self-promotion
  end if;

  return new;
end $$;

revoke execute on function public.protect_id_status() from public;

-- 4. Reviews ----------------------------------------------------------------
-- One review per booking per author; no self-reviews; only for a real,
-- paid-for stay; the target is derived server-side, never trusted.
delete from public.reviews a
  using public.reviews b
 where a.booking_id = b.booking_id
   and a.author_id  = b.author_id
   and a.ctid > b.ctid;

alter table public.reviews
  drop constraint if exists reviews_one_per_booking_author;
alter table public.reviews
  add constraint reviews_one_per_booking_author unique (booking_id, author_id);

create or replace function public.enforce_review_integrity()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  b public.bookings%rowtype;
  host uuid;
begin
  if public.is_privileged() then
    return new;
  end if;

  select * into b from public.bookings where id = new.booking_id;
  if not found then
    raise exception 'Booking does not exist';
  end if;
  if b.renter_id <> new.author_id then
    raise exception 'You can only review your own booking';
  end if;
  if b.status not in ('confirmed', 'active', 'completed')
     or b.payment_status <> 'paid' then
    raise exception 'You can only review a paid booking';
  end if;

  select l.host_id into host from public.listings l where l.id = b.listing_id;
  if host is null then
    raise exception 'Listing not found';
  end if;
  if host = new.author_id then
    raise exception 'You cannot review yourself';
  end if;

  new.target_id := host;  -- never trust a client-supplied target
  return new;
end $$;

drop trigger if exists enforce_review_integrity on public.reviews;
create trigger enforce_review_integrity
  before insert on public.reviews
  for each row execute function public.enforce_review_integrity();

revoke execute on function public.enforce_review_integrity() from public;

-- 5. Length caps ------------------------------------------------------------
-- Unbounded text columns are a cheap storage-abuse vector.
alter table public.listings drop constraint if exists listings_text_len;
alter table public.listings add constraint listings_text_len check (
  length(title) <= 120 and length(coalesce(description, '')) <= 4000
  and length(city) <= 80 and length(area) <= 80
  and length(coalesce(size_label, '')) <= 60
);

alter table public.reviews drop constraint if exists reviews_comment_len;
alter table public.reviews add constraint reviews_comment_len
  check (length(coalesce(comment, '')) <= 2000);

alter table public.profiles drop constraint if exists profiles_text_len;
alter table public.profiles add constraint profiles_text_len check (
  length(coalesce(full_name, '')) <= 120
  and length(coalesce(legal_name, '')) <= 120
  and length(coalesce(phone, '')) <= 32
  and length(coalesce(bio, '')) <= 1000
);

-- 6. Storage ----------------------------------------------------------------
-- Enforce type/size at the platform edge too: a public bucket that accepts
-- text/html serves attacker-controlled pages from a trusted domain.
update storage.buckets
   set file_size_limit = 6291456,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'avatars';

update storage.buckets
   set file_size_limit = 6291456,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
 where id = 'id-documents';
