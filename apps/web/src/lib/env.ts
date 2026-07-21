// Startup env validation. Catches the misconfigurations that otherwise surface
// as confusing runtime failures (half-configured Supabase, Stripe keys without
// a webhook secret, etc.). Imported once from the root layout.

const isProd = process.env.NODE_ENV === "production";

function fail(msg: string) {
  // In production a broken config should be loud; in dev, warn and keep going
  // so the mock-data experience still works.
  if (isProd) throw new Error(`[env] ${msg}`);
  console.warn(`[env] ${msg}`);
}

let validated = false;

export function validateEnv() {
  if (validated) return;
  validated = true;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Both or neither — a single half of the pair is always a mistake.
  if (Boolean(url) !== Boolean(anon)) {
    fail(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set together (found only one).",
    );
  }

  // If real card payments are on, the pieces that finalize them must exist too.
  if (process.env.STRIPE_SECRET_KEY) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      fail("STRIPE_SECRET_KEY is set but STRIPE_WEBHOOK_SECRET is missing — bookings can't finalize.");
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      fail(
        "STRIPE_SECRET_KEY is set but SUPABASE_SERVICE_ROLE_KEY is missing — the webhook can't confirm bookings.",
      );
    }
  }

  // Not fatal, but every absolute URL (emails, Stripe redirects, sitemap) is
  // wrong without it in production.
  if (isProd && !process.env.NEXT_PUBLIC_SITE_URL) {
    console.warn("[env] NEXT_PUBLIC_SITE_URL is not set — absolute URLs fall back to localhost.");
  }
}
