// Marketplace fee model (illustrative — see docs/01-business-model.md).
// Renter pays rent + renter fee; host receives rent - host fee; the platform
// keeps both fees (~20% blended take), charged as the Stripe application fee.

export const RENTER_FEE_RATE = 0.08;
export const HOST_FEE_RATE = 0.12;

export interface Quote {
  months: number;
  rent: number; // base rent (SEK)
  renterFee: number; // added on top, paid by renter
  total: number; // what the renter pays
  hostFee: number; // deducted from the host
  hostPayout: number; // what the host receives
  platformTake: number; // platform revenue = application_fee_amount
}

export function quote(pricePerMonth: number, months: number): Quote {
  const m = Math.min(12, Math.max(1, Math.round(months) || 1));
  const rent = pricePerMonth * m;
  const renterFee = Math.round(rent * RENTER_FEE_RATE);
  const hostFee = Math.round(rent * HOST_FEE_RATE);
  return {
    months: m,
    rent,
    renterFee,
    total: rent + renterFee,
    hostFee,
    hostPayout: rent - hostFee,
    platformTake: renterFee + hostFee,
  };
}

/** True when Stripe secret key is present (server-only). */
export const isStripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);
