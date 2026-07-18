# 05 — MVP roadmap

The guiding rule: **liquidity in one geography × one category before anything else.** A marketplace
that's "a little bit available everywhere" is dead; one that reliably works in a single neighborhood
is alive. Resist the urge to launch multi-city, multi-category. Go narrow, then widen.

---

## Phase 0 — Validation (weeks 0–6)

**Goal: prove people want this before writing app code.**

- **Pick the wedge.** Recommended: **parking in one dense city district** (e.g., a Stockholm or
  Göteborg inner-city area). Parking is high-frequency, low-consideration, and has obvious scarcity —
  the fastest path to repeat transactions and word-of-mouth.
- **Landing page + waitlist** (the one in [`/web`](../web/index.html)) to capture demand and supply signups.
- **Customer discovery:** interview 15–20 potential hosts (people leasing spaces) and 15–20 renters.
  Test willingness to pay and the subletting-consent concern head-on.
- **Manual concierge test:** match a handful of hosts and renters *by hand* (spreadsheet + Swish +
  a signed agreement). If you can't create value manually, software won't fix it.
- **Legal groundwork:** first advokat/revisor conversations on subletting, VAT-on-parking, DAC7 ([02](02-legal-and-compliance.md)).

**Exit criteria:** a waitlist with real supply *and* demand in one district, and ≥5 successful manual matches.

## Phase 1 — MVP (months 2–5)

**Goal: automate the manual match for one city × parking. Ship a real, transactable product.**

Scope — the minimum that lets a stranger find, book, and pay for a space:

- Responsive **PWA** (web-first; installable, push).
- **BankID** auth + identity verification.
- Listing creation with photos, calendar, pricing, **right-to-sublet attestation**.
- **Search** (map + filters) scoped to the launch city.
- **Booking + checkout** with **Stripe Connect** escrow (card + Swish), automated payouts.
- **In-app messaging**, two-way **reviews**.
- **Manual ops:** you personally handle KYC review, disputes, and onboarding (don't build admin
  automation yet).
- **DAC7-ready** seller data collection baked into onboarding.

**Tech:** Supabase (Postgres + PostGIS + auth + storage) + Next.js + Stripe Connect + Mapbox +
BankID via Criipto/Signicat. See [07 — Tech architecture](07-tech-architecture.md).

**Exit criteria:** self-serve bookings happening weekly without you touching the transaction; positive
search-to-book conversion; hosts getting paid out cleanly.

## Phase 2 — Product depth & second category (months 5–10)

**Goal: deepen trust, add a category, prepare to scale.**

- **Native mobile apps** (React Native/Expo) — better in-the-moment parking UX, camera/QR, push.
- Add a second category: **storage/förråd** (higher ticket, lower churn — improves economics).
- **Trust upgrades:** protection plan (insurance partner), deposits, **consent-badge verification**.
- **Host tools:** multi-listing dashboard, dynamic-pricing suggestions.
- **Access pilots:** QR/keypad codes; smart-lock trial for storage.
- Start **admin automation** (moderation queues, dispute workbench).

## Phase 3 — B2B supply & multi-city (months 10–18)

**Goal: unlock large, clean supply and grow geographically.**

- **BRF & property-manager onboarding** — bulk-list idle allocations; consent is automatic because
  they *are* the landlord ([02](02-legal-and-compliance.md)). This is the supply flywheel.
- **Subscription tier** for power hosts; **promoted listings**.
- Expand to **2–4 more cities**, one at a time, only after each is liquid.
- Add **boat berths** (seasonal, high-ticket) and garages.
- **LPR / access hardware** integrations at scale.

## Phase 4 — Scale & Nordics (18 months+)

- Expand to **Norway / Denmark / Finland** (localize payments, tax, language).
- **White-label / API** for operators and municipalities.
- Embedded insurance at scale; data-driven pricing; mature fraud/risk.

---

## Team you'll need (lean)

- **Phase 0–1:** 1–2 full-stack engineers, a hands-on founder doing ops/sales, fractional legal.
- **Phase 2:** + mobile engineer, + part-time ops/support, + designer.
- **Phase 3+:** dedicated growth, B2B sales, ops lead, and a compliance owner.

## What *not* to build early

- Native apps in Phase 1 (PWA is enough).
- Admin automation before you've felt the manual pain.
- Multiple categories/cities before the first is liquid.
- Your own payments/escrow (regulatory trap — use a provider).
- Insurance underwriting in-house (partner first).
