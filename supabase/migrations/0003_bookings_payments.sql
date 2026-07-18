-- Booking payments + Stripe Connect fields.
-- See docs/02 (payments never touch our servers — Stripe holds funds) and
-- docs/04 (escrow release). RLS on bookings is defined in 0001.

alter table public.profiles
  add column if not exists stripe_account_id text,        -- Stripe Connect (Express) account
  add column if not exists payouts_enabled boolean not null default false;

alter table public.bookings
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'refunded', 'failed')),
  add column if not exists stripe_payment_intent_id text;
