-- Airbnb-style identity (replaces the BankID plan): profile fields + an
-- uploaded ID image with a verification status. IDs live in a PRIVATE bucket,
-- owner-scoped by RLS. Production note: prefer a verification provider
-- (e.g. Stripe Identity) over storing raw ID images long-term, and set a short
-- retention on the id-documents bucket (GDPR — see docs/02).

-- 1) Profile columns -----------------------------------------------------------
alter table public.profiles
  add column if not exists legal_name        text,
  add column if not exists avatar_url        text,
  add column if not exists id_document_path  text,
  add column if not exists id_status         text not null default 'unverified'
    check (id_status in ('unverified', 'pending', 'verified', 'rejected')),
  add column if not exists phone             text,
  add column if not exists bio               text;

-- Keep the demo host looking verified in the seeded data.
update public.profiles
  set id_status = 'verified'
  where id = '11111111-1111-1111-1111-111111111111';

-- 2) Storage buckets -----------------------------------------------------------
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('id-documents', 'id-documents', false)
  on conflict (id) do nothing;

-- 3) Storage RLS (files are stored under a "<uid>/..." folder) ------------------
-- Avatars: world-readable; each user manages only their own folder.
drop policy if exists "avatar public read"  on storage.objects;
drop policy if exists "avatar owner write"  on storage.objects;
drop policy if exists "avatar owner update" on storage.objects;
create policy "avatar public read" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatar owner write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatar owner update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ID documents: PRIVATE. Only the owner (and the service role) can read/write.
drop policy if exists "id owner read"   on storage.objects;
drop policy if exists "id owner write"  on storage.objects;
drop policy if exists "id owner update" on storage.objects;
create policy "id owner read" on storage.objects
  for select using (
    bucket_id = 'id-documents' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "id owner write" on storage.objects
  for insert with check (
    bucket_id = 'id-documents' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "id owner update" on storage.objects
  for update using (
    bucket_id = 'id-documents' and (storage.foldername(name))[1] = auth.uid()::text
  );
