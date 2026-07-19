-- Security hardening (from the Supabase security advisor):
-- 1) Public buckets serve object URLs without any SELECT policy; a broad SELECT
--    policy only lets clients LIST every file. Drop it for the avatars bucket.
drop policy if exists "avatar public read" on storage.objects;

-- 2) Trigger-only functions must not be callable via PostgREST RPC. Every
--    function gets an implicit EXECUTE grant to PUBLIC on creation, which the
--    earlier per-role revokes didn't remove.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.auto_confirm_user() from public;
revoke execute on function public.protect_id_status() from public;
