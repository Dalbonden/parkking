# 08 — Launch readiness (engineering)

> Scope: what the **code** needs before real users and real money. Legal/compliance is
> tracked separately in [02](02-legal-and-compliance.md). Status as of this pass.
>
> Legend: ✅ done · 🟡 code ready, needs your account/keys · ⬜ not started

---

## The two kinds of work left

1. **Things I can finish in code now** — no external account needed. Done in this pass (below).
2. **Things gated on an account only you can open** — Stripe, Mapbox, an email provider,
   Vercel, a domain, error/analytics vendors. I can wire the code and leave a one-line
   switch, but I can't create the accounts or hold the secrets.

---

## M0 — Correctness & hardening (this pass) ✅

These are launch-blockers that don't need any third party.

| Item | Status | Notes |
|------|--------|-------|
| **Session refresh** (`proxy.ts`) | ✅ | Next 16 renamed middleware → proxy. Without it, Supabase SSR tokens never refresh and users get silently logged out. |
| Server-side integrity (RLS + triggers) | ✅ | Migrations 0008–0010: bookings/listings/profiles/reviews can't be forged from the client. See [security notes](#). |
| Admin moderation console | ✅ | `/admin`, DB-backed admin model, no service-role key in the app. |
| Error boundaries | ✅ | `error.tsx`, `global-error.tsx`, `not-found.tsx`, `loading.tsx`. |
| SEO surface | ✅ | `robots.ts` (noindex `/admin`, `/dashboard`, `/profile`, `/bookings`), dynamic `sitemap.ts` over active listings. |
| Env validation | ✅ | Fails fast in production if required vars are missing; warns in dev. |
| Security headers | ✅ | HSTS, Permissions-Policy, baseline CSP added to the existing X-Frame-Options / nosniff set. |
| Listing cover photos | ✅ | Public `listing-photos` bucket + upload in list-space + shown on cards/detail. A marketplace with no photos won't convert. |
| Booking cancellation | ✅ | Renter/host can cancel; transitions constrained by a DB trigger. |

## M1 — Payments for real (needs your Stripe account) 🟡

The booking flow already builds a Stripe Connect destination charge with an application
fee, and the webhook verifies amount + idempotency. What's missing is **account setup**:

- ⬜ Create the Stripe account; put `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`,
  `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` in env (all gitignored).
- 🟡 **Host onboarding** (Connect Express): a "Aktivera utbetalningar" flow that creates a
  connected account and stores `stripe_account_id` / `payouts_enabled`. Code path is stubbed
  in the booking action; the onboarding screen itself is the remaining build.
- ⬜ Point a Stripe webhook at `/api/stripe/webhook`.
- ⬜ Refund path on cancellation (Stripe refund + `payment_status='refunded'`).

## M2 — Maps & discovery (needs a Mapbox token) 🟡

- 🟡 Replace `map-placeholder` with a real Mapbox map; PostGIS geo-search is already in the
  schema (`location geography`, GIST index). Needs `NEXT_PUBLIC_MAPBOX_TOKEN`.
- ⬜ "Search this area" / radius filter wired to a PostGIS `ST_DWithin` query.

## M3 — Transactional email (needs Resend/Postmark) 🟡

Auth currently **auto-confirms** users (migration 0002, demo only). Before launch:

- ⬜ Turn off auto-confirm; configure SMTP (Resend) in Supabase Auth.
- 🟡 Password reset flow (`resetPasswordForEmail` + `/reset-password`) — code can land now,
  but it's useless until email is delivering, so it ships with M3.
- ⬜ Booking confirmation / cancellation / review-request emails.
- ⬜ Turn on **leaked-password protection** (Supabase Auth toggle — the last advisor warning).

## M4 — Deploy (needs Vercel + a domain) 🟡

- ⬜ Vercel project, EU region (`arn1`/Stockholm to match the DB), env vars set.
- ⬜ Custom domain + TLS; set `NEXT_PUBLIC_SITE_URL`.
- ⬜ Move PostGIS out of the `public` schema (one advisor warning) — do at deploy time.

## M5 — Observability & abuse (needs Sentry/PostHog + Upstash) 🟡

- 🟡 Sentry (errors) + PostHog (product analytics) — SDKs drop into `proxy.ts` / `error.tsx`.
- ⬜ **Rate limiting** on auth + write server actions (Upstash Redis or Vercel KV). Currently
  none; a launch blocker for abuse resistance.
- ⬜ DB backups / PITR review on the Supabase plan.

## M6 — Quality gates (no account needed) ⬜

- ⬜ Test suite (Vitest for `lib/*` pure logic — `payments.quote`, fee math; Playwright for
  the booking + admin happy paths).
- ⬜ GitHub Actions CI: typecheck + lint + test + build on PRs.
- ⬜ A basic listing-photo/cover fallback and image optimization pass.

---

## The single most important sequence

1. **Stripe account + host onboarding (M1)** — without payouts there's no marketplace.
2. **Email (M3)** — real signup confirmation + password reset.
3. **Deploy (M4)** — Vercel + domain.
4. **Rate limiting (M5)** — before you advertise.

Everything in M0 is done. M1–M5 each start the moment the matching account exists.
