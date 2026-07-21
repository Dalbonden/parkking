-- Booking cancellation. Until now bookings had no UPDATE policy, so only the
-- service role could change them. Let a participant (the renter or the listing's
-- host) cancel — but nothing else. A BEFORE UPDATE trigger pins every immutable
-- field and permits only the status transition to 'cancelled' from an active
-- state, so this can't be abused to rewrite amounts, dates, or payment status.

drop policy if exists "participants update booking" on public.bookings;
create policy "participants update booking" on public.bookings
  for update using (
    auth.uid() = renter_id
    or auth.uid() = (select l.host_id from public.listings l where l.id = listing_id)
  ) with check (
    auth.uid() = renter_id
    or auth.uid() = (select l.host_id from public.listings l where l.id = listing_id)
  );

create or replace function public.enforce_booking_update()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.is_privileged() then
    return new;  -- Stripe webhook / admin may transition freely
  end if;

  -- Immutable from the client's side.
  new.listing_id := old.listing_id;
  new.renter_id := old.renter_id;
  new.start_date := old.start_date;
  new.end_date := old.end_date;
  new.amount_total := old.amount_total;
  new.service_fee := old.service_fee;
  new.stripe_payment_intent_id := old.stripe_payment_intent_id;
  new.created_at := old.created_at;
  -- Refunds are a privileged action (Stripe webhook), never a client's to set.
  new.payment_status := old.payment_status;

  -- The only permitted client transition is cancellation of an active booking.
  if new.status is distinct from old.status then
    if not (new.status = 'cancelled' and old.status in ('requested', 'confirmed')) then
      new.status := old.status;
    end if;
  end if;

  return new;
end $$;

drop trigger if exists enforce_booking_update on public.bookings;
create trigger enforce_booking_update
  before update on public.bookings
  for each row execute function public.enforce_booking_update();

revoke execute on function public.enforce_booking_update() from anon, authenticated, public;
