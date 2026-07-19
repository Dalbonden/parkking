-- Complete the storage policy set: owners may delete their own uploads
-- (needed to replace/remove a profile photo or re-submit an ID).
drop policy if exists "avatar owner delete" on storage.objects;
create policy "avatar owner delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "id owner delete" on storage.objects;
create policy "id owner delete" on storage.objects
  for delete using (
    bucket_id = 'id-documents' and (storage.foldername(name))[1] = auth.uid()::text
  );
