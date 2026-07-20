-- Admin / moderation model.
--
-- Design: "admin" is a database fact, not an app setting. Membership lives in
-- public.admins, which has RLS enabled and NO insert/update/delete policy, so
-- it can only be seeded by the service role or a direct connection (a migration
-- like this one). A user therefore cannot promote themselves — the same
-- principle as the 0008 integrity triggers.
--
-- The admin console then runs on the admin's own authenticated session (no
-- service-role key in the app): RLS policies grant admins read/write across the
-- moderation surface, and the 0008 triggers recognise admins so approvals can
-- set the protected columns.

create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- A role needs the table-level SELECT grant before RLS can filter rows;
-- without it, is_admin() would raise "permission denied" and break even public
-- listing reads. RLS below restricts what each role actually sees.
grant select on public.admins to anon, authenticated;

-- Everyone may check their OWN admin row; nobody can see the full roster and
-- nobody can write through the API (no insert/update/delete policy exists).
drop policy if exists "see own admin row" on public.admins;
create policy "see own admin row" on public.admins
  for select using (auth.uid() = user_id);

-- is_admin(): SECURITY INVOKER on purpose. In an RLS policy it runs as the
-- caller and sees only their own admins row (so it can't be flagged as a
-- SECURITY DEFINER escalation). Inside the SECURITY DEFINER triggers it runs as
-- the trigger owner but still keys off auth.uid() from the request JWT, so it
-- correctly identifies the acting browser user.
create or replace function public.is_admin()
returns boolean language sql stable security invoker set search_path = '' as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- Moderation bypass for admins ------------------------------------------------
-- Extend the 0008 triggers so an admin's writes pass through unpinned. Normal
-- users are still fully constrained; direct/service connections still bypass
-- via is_privileged().
create or replace function public.protect_listing_fields()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_privileged() or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.status := 'pending_review'; new.moderation_approved := false;
    new.consent_verified := false; new.rating := 0; new.review_count := 0;
    return new;
  end if;

  new.host_id := old.host_id;
  new.moderation_approved := old.moderation_approved;
  new.consent_verified := old.consent_verified;
  new.rating := old.rating;
  new.review_count := old.review_count;
  if new.status is distinct from old.status then
    if new.status = 'active' and not old.moderation_approved then
      new.status := old.status;
    elsif new.status = 'pending_review' and old.status = 'active' then
      new.status := old.status;
    end if;
  end if;
  return new;
end $$;

create or replace function public.protect_id_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_privileged() or public.is_admin() then
    return new;
  end if;

  new.id := old.id;
  new.is_id_verified := old.is_id_verified;
  new.stripe_account_id := old.stripe_account_id;
  new.payouts_enabled := old.payouts_enabled;
  if new.id_status is distinct from old.id_status
     and new.id_status in ('verified', 'rejected') then
    new.id_status := old.id_status;
  end if;
  return new;
end $$;

-- Admin RLS across the moderation surface ------------------------------------
-- Listings: read every listing (any status) and update any listing.
drop policy if exists "admins select all listings" on public.listings;
create policy "admins select all listings" on public.listings
  for select using (public.is_admin());

drop policy if exists "admins update any listing" on public.listings;
create policy "admins update any listing" on public.listings
  for update using (public.is_admin()) with check (public.is_admin());

-- Profiles are already publicly selectable; admins additionally may update any
-- profile (to set id_status; the trigger above lets it through for admins).
drop policy if exists "admins update any profile" on public.profiles;
create policy "admins update any profile" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- Private ID documents: admins may read any object to render it for review.
drop policy if exists "admins read id docs" on storage.objects;
create policy "admins read id docs" on storage.objects
  for select using (bucket_id = 'id-documents' and public.is_admin());

-- Seed the first admin (the existing test account). Replace/extend as needed.
insert into public.admins (user_id)
values ('0315342b-d307-42d2-82b8-13388697ae2b')
on conflict (user_id) do nothing;
