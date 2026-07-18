# 07 — Tech architecture

Optimize for **shipping a transactable MVP fast** with a small team, then hardening as you scale.
The stack below is chosen so one or two full-stack engineers can build Phase 1 without standing up
much infrastructure.

## Recommended stack (Phase 1 MVP)

| Layer | Choice | Why |
|-------|--------|-----|
| **Web frontend** | **Next.js (React) + TypeScript**, as an installable **PWA** | One codebase, SSR for SEO on listing pages, fast iteration |
| **UI** | Tailwind CSS + a component library (shadcn/ui) | Speed and consistency |
| **Backend / DB** | **Supabase** (Postgres + **PostGIS** + Auth + Storage + Edge Functions) | Batteries-included; PostGIS gives geo-search out of the box; EU region for GDPR |
| **Payments** | **Stripe Connect** (Express/Custom accounts) | Escrow, split payments, payouts, KYC — you never hold funds ([02](02-legal-and-compliance.md)) |
| **Local payments** | **Swish** (via provider) | Nordic must-have |
| **Identity** | **BankID** via **Criipto** or **Signicat** | Nordic trust anchor + KYC ([04](04-trust-and-safety.md)) |
| **Maps / geo** | **Mapbox** (or Google Maps) | Map search, geocoding, directions |
| **Notifications** | Email (Resend/Postmark) + Web Push; later native push | Booking/message/payout events |
| **Hosting** | **Vercel** (web) + Supabase (backend), **EU regions** | Simple, scalable, GDPR-friendly |
| **Analytics/observability** | PostHog (product) + Sentry (errors) | Track the liquidity metrics in [01](01-business-model.md) |

> **Why Supabase:** it collapses auth, database, geo-search, file storage, and serverless functions
> into one managed service so a tiny team can focus on product, not plumbing. Postgres also scales far
> enough that you won't need to re-platform for a long time.

## Phase 2 — native mobile

- **React Native (Expo)** sharing TypeScript logic/types with the Next.js web app.
- Native camera/QR, background location (parking), push, and **smart-lock SDKs** (August/Nuki/igloohome).
- Publish to App Store / Google Play once background location and access hardware justify going native
  ([03](03-product-features.md)).

## Data model (core entities)

```
User ──< Listing ──< Availability
 │         │
 │         └──< Booking >── Payment (Stripe) ── Payout
 │                │
 │                ├── Review (two-way)
 │                └── AccessGrant (QR / smart-lock / LPR)
 │
 ├── IdentityVerification (BankID)
 ├── ConsentDocument (right-to-sublet)     ← trust badge
 └── PayoutAccount (Stripe Connect / KYC)

Dispute ── evidence (messages, access logs, photos)
```

Key notes:
- **Geo:** store listing location as PostGIS `geography(Point)`; index with GiST for radius/bbox search.
- **Location privacy:** show an *obfuscated* location publicly; reveal exact coordinates only after
  booking ([04](04-trust-and-safety.md)).
- **Money:** never store card data (Stripe tokenizes); keep an immutable ledger of fees/payouts for
  accounting and DAC7 ([02](02-legal-and-compliance.md)).
- **Audit:** log access events and status changes for dispute resolution.

## Security & compliance engineering

- **Row-Level Security (RLS)** in Supabase so users can only read/write their own data.
- **EU data residency**; encrypt PII at rest; short retention for license plates / precise location.
- **Secrets** in the platform's secret manager, never in the repo (see `.gitignore`).
- **Webhooks** (Stripe, BankID) verified by signature; idempotent handlers.
- **PCI scope minimized** by using Stripe-hosted payment elements.
- DPAs with every subprocessor; DSA notice-and-action endpoint.

## Suggested repo evolution

```
platsdela/
├── docs/                 # (this) strategy + product docs
├── web/                  # Phase 0 landing page → grows into the Next.js app
├── apps/
│   ├── web/              # Next.js PWA (Phase 1)
│   └── mobile/           # Expo app (Phase 2)
├── packages/
│   ├── shared/           # shared TS types, validation, pricing logic
│   └── ui/               # shared component library
└── supabase/             # migrations, RLS policies, edge functions
```

Start as a single app; adopt the monorepo (Turborepo/pnpm workspaces) when the mobile app arrives.

## Build vs. buy (default to *buy* early)

- **Buy:** identity (Criipto/Signicat), payments/escrow (Stripe), maps (Mapbox), email (Resend),
  smart locks (vendor SDKs), insurance (partner). These are commodity, regulated, or risky to DIY.
- **Build:** the marketplace logic, trust/reputation system, search/matching, and the consent-
  verification flow — that's your actual product and moat.
