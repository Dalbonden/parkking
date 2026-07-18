import Stripe from "stripe";

let cached: Stripe | null = null;

/** Server-side Stripe client, or null when STRIPE_SECRET_KEY isn't set. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!cached) cached = new Stripe(key);
  return cached;
}
