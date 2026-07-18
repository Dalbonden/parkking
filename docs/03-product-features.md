# 03 — Product features

Features are grouped by **release phase** so you build the minimum that creates liquidity first.
See [05 — MVP roadmap](05-mvp-roadmap.md) for the timeline.

## Two-sided from day one

Every marketplace has two apps in one product: the **host** (lister) experience and the **renter**
(searcher) experience, plus an internal **ops/admin** console.

---

## Renter (demand side)

**MVP**
- **Map + list search** with location, dates/times, and category (parking / garage / storage / berth).
- **Filters:** price, size/dimensions (vehicle length/height for parking, m³ for storage, LOA/beam for berths), covered/uncovered, EV charging, 24/7 access, security features, access type.
- **Listing page:** photos, exact-ish location (obfuscated until booked), price (hourly/daily/monthly), rules, host rating, availability calendar.
- **Booking flow:** instant-book *or* request-to-book; transparent all-in price (incl. fees + VAT).
- **Checkout & payment** (card / Swish) with escrow hold.
- **In-app messaging** with the host (pre- and post-booking).
- **Booking management:** upcoming/active/past, receipts.
- **Reviews** after the stay.

**Later**
- Navigation/hand-off to the exact spot, **digital access** (QR/keypad/smart-lock), check-in/out.
- **Extend booking** in one tap from the app.
- Saved searches + alerts ("notify me when a space opens near X").
- Favorites, price-drop alerts.

## Host (supply side)

**MVP**
- **Listing creation:** category, photos, description, location, dimensions, access instructions, house rules.
- **Right-to-sublet attestation** (BankID-signed) + optional consent-document upload → trust badge. See [02](02-legal-and-compliance.md).
- **Pricing** with local comp suggestions; hourly/daily/monthly.
- **Availability calendar** (block dates, set recurring availability).
- **Accept/decline requests**, or turn on instant-book.
- **Payouts** (via Stripe Connect / Adyen) + earnings summary.
- **Messaging** with renters.

**Later**
- **Multi-listing dashboard** for property managers/BRFs (bulk import, occupancy heatmap, per-space P&L).
- **Smart-lock / access management** and LPR (license-plate recognition) for parking/garages.
- **Dynamic pricing** automation.
- **Tax/VAT summaries** and DAC7-ready earnings exports.
- **Payout scheduling**, sub-accounts for teams.

## Ops / admin (internal)

**MVP**
- User & listing moderation, KYC review queue, consent-badge approvals.
- Booking/transaction ledger, refunds, manual payout intervention.
- **Dispute resolution** workbench (evidence, messaging log, resolution actions).
- Basic support tooling and content flags (DSA notice-and-action).

**Later**
- Fraud/risk scoring, automated moderation, analytics dashboards, cohort/liquidity reporting.

---

## Cross-cutting

- **Identity:** BankID sign-in and verification (Nordic trust anchor). See [04](04-trust-and-safety.md).
- **Notifications:** email + push (booking, message, payout, dispute).
- **i18n:** Swedish first; architecture ready for Norwegian/Danish/Finnish/English.
- **Accessibility & mobile-first:** most searches happen on a phone in the moment of need.

## Platform strategy: web first, native app second

- **Phase 1:** a **responsive PWA** (installable, push-capable) covers ~90% of needs, ships fastest,
  and avoids app-store review friction while you iterate.
- **Phase 2:** **native mobile apps** (React Native/Expo — shared code with the web) once you need
  reliable background location, smoother camera/QR, native smart-lock SDKs, and app-store presence.
  Parking especially benefits from a fast native in-the-moment experience.

## Signature "wow" features (differentiators, not MVP)

- **One-tap consent verification** that makes subletting demonstrably legitimate.
- **Multi-asset account:** a boat owner who also leases a winter storage unit and a city parking spot
  manages all three in one place.
- **BRF/property-manager onboarding** that turns a whole building's idle allocations into supply overnight.
- **Access without key exchange:** QR/keypad/LPR so nobody has to meet to hand over a fob.
