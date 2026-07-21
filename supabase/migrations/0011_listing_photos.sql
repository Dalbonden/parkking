-- Listing cover photos. A public bucket so object URLs resolve without auth;
-- writes are owner-scoped by folder (<uid>/<listingId>.<ext>). Per the 0007
-- lesson, we deliberately add NO broad SELECT policy — a public bucket serves
-- object URLs without one, and a SELECT policy would only let clients LIST
-- every file.

alter table public.listings add column if not exists cover_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos', 'listing-photos', true, 6291456,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "listing photo owner write" on storage.objects;
create policy "listing photo owner write" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "listing photo owner update" on storage.objects;
create policy "listing photo owner update" on storage.objects
  for update to authenticated using (
    bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "listing photo owner delete" on storage.objects;
create policy "listing photo owner delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
