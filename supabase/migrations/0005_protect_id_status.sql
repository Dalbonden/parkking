-- Security: users must not be able to verify themselves. The "users update own
-- profile" policy (0001) allows updating any own column, so without this a user
-- could PATCH id_status to 'verified'. Only a reviewer (service role) may set
-- 'verified'/'rejected'; a user can still reach 'pending' by uploading an ID.
create or replace function public.protect_id_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.id_status is distinct from old.id_status
     and new.id_status in ('verified', 'rejected')
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    new.id_status := old.id_status;  -- silently ignore self-promotion
  end if;
  return new;
end $$;

drop trigger if exists protect_id_status on public.profiles;
create trigger protect_id_status
  before update on public.profiles
  for each row execute function public.protect_id_status();

revoke execute on function public.protect_id_status() from anon, authenticated;
