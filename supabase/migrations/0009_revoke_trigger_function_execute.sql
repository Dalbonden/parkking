-- Follow-up to 0008: Supabase grants EXECUTE on functions in the public schema
-- to anon/authenticated by default, so `revoke ... from public` alone leaves
-- trigger functions reachable at /rest/v1/rpc/<name>. Revoke from the roles too.
revoke execute on function public.enforce_booking_integrity() from anon, authenticated, public;
revoke execute on function public.enforce_review_integrity()  from anon, authenticated, public;
revoke execute on function public.protect_listing_fields()    from anon, authenticated, public;
revoke execute on function public.protect_id_status()         from anon, authenticated, public;
revoke execute on function public.handle_new_user()           from anon, authenticated, public;
revoke execute on function public.is_privileged()             from anon, authenticated, public;
