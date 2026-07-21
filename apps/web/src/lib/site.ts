/**
 * Canonical public base URL. Set NEXT_PUBLIC_SITE_URL in production (e.g.
 * https://platsdela.se); falls back to localhost for dev. No trailing slash.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
