-- Platsdela — initial schema (Supabase / Postgres + PostGIS)
-- See docs/07-tech-architecture.md. This is an MVP starting point; harden RLS,
-- add DAC7 fields, deposits, disputes and access grants as the product grows.

-- Extensions -----------------------------------------------------------------
create extension if not exists postgis;

-- Enums ----------------------------------------------------------------------
do $$ begin
  create type listing_category as enum ('parking', 'garage', 'storage', 'boat');
exception when duplicate_object then null; end $$;

do $$ begin
  create type listing_status as enum ('pending_review', 'active', 'paused', 'removed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('requested', 'confirmed', 'active', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

-- Profiles (1:1 with auth.users) ---------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text,
  is_id_verified boolean not null default false,   -- BankID verified
  is_host       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Listings -------------------------------------------------------------------
create table if not exists public.listings (
  id               uuid primary key default gen_random_uuid(),
  host_id          uuid not null references public.profiles (id) on delete cascade,
  category         listing_category not null,
  title            text not null,
  description      text,
  city             text not null,
  area             text not null,
  price_per_month  integer not null check (price_per_month > 0),  -- SEK
  size_label       text,
  covered          boolean not null default false,
  ev_charging      boolean not null default false,
  access_247       boolean not null default false,
  consent_verified boolean not null default false,  -- right-to-sublet verified (docs/02)
  status           listing_status not null default 'pending_review',
  lat              double precision,                -- denormalized for easy client reads
  lng              double precision,
  location         geography(Point, 4326),          -- lng/lat (for PostGIS geo-search)
  rating           numeric(2,1) not null default 0,
  review_count     integer not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists listings_location_gix on public.listings using gist (location);
create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_city_idx on public.listings (city);

-- Bookings -------------------------------------------------------------------
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid not null references public.listings (id) on delete cascade,
  renter_id     uuid not null references public.profiles (id) on delete cascade,
  start_date    date not null,
  end_date      date not null,
  status        booking_status not null default 'requested',
  amount_total  integer not null,   -- SEK, incl. service fee
  service_fee   integer not null default 0,
  created_at    timestamptz not null default now(),
  check (end_date >= start_date)
);

create index if not exists bookings_listing_idx on public.bookings (listing_id);
create index if not exists bookings_renter_idx on public.bookings (renter_id);

-- Reviews (two-way) ----------------------------------------------------------
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references public.bookings (id) on delete cascade,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  target_id   uuid not null references public.profiles (id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);

-- Consent documents (right-to-sublet evidence, docs/02) ----------------------
create table if not exists public.consent_documents (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings (id) on delete cascade,
  doc_url     text not null,
  status      text not null default 'pending',   -- pending | approved | rejected
  created_at  timestamptz not null default now()
);

-- Row Level Security ---------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.listings          enable row level security;
alter table public.bookings          enable row level security;
alter table public.reviews           enable row level security;
alter table public.consent_documents enable row level security;

-- Profiles: publicly readable (marketplace trust), self-writable.
create policy "profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);
create policy "users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Listings: active listings public; hosts manage their own.
create policy "active listings are public"
  on public.listings for select using (status = 'active' or auth.uid() = host_id);
create policy "hosts insert own listings"
  on public.listings for insert with check (auth.uid() = host_id);
create policy "hosts update own listings"
  on public.listings for update using (auth.uid() = host_id);
create policy "hosts delete own listings"
  on public.listings for delete using (auth.uid() = host_id);

-- Bookings: visible to the renter and the listing's host; renter creates.
create policy "bookings visible to participants"
  on public.bookings for select using (
    auth.uid() = renter_id
    or auth.uid() = (select host_id from public.listings l where l.id = listing_id)
  );
create policy "renter creates own booking"
  on public.bookings for insert with check (auth.uid() = renter_id);

-- Reviews: publicly readable; author writes their own.
create policy "reviews are public"
  on public.reviews for select using (true);
create policy "author creates own review"
  on public.reviews for insert with check (auth.uid() = author_id);

-- Consent docs: only the listing's host.
create policy "host manages own consent docs"
  on public.consent_documents for all using (
    auth.uid() = (select host_id from public.listings l where l.id = listing_id)
  );

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- It's a trigger-only function; don't expose it via PostgREST RPC.
revoke execute on function public.handle_new_user() from anon, authenticated;

-- Known advisories accepted for the MVP (PostGIS-inherent, no user data exposed):
--   * public.spatial_ref_sys lacks RLS, and postgis lives in the public schema.
--     Remediation for production: install postgis in a dedicated `extensions`
--     schema. See https://supabase.com/docs/guides/database/database-linter
--   * Enable leaked-password protection in Auth settings before launch.
