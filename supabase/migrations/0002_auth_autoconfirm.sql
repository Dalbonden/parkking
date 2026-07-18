-- Demo auth: auto-confirm new users so email/password sign-in works without an
-- email round-trip. In production, REMOVE this and enable real email
-- confirmation (or use BankID via Criipto/Signicat, see docs/07).
create or replace function public.auto_confirm_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end $$;

drop trigger if exists auto_confirm_new_user on auth.users;
create trigger auto_confirm_new_user
  before insert on auth.users
  for each row execute function public.auto_confirm_user();

revoke execute on function public.auto_confirm_user() from anon, authenticated;
