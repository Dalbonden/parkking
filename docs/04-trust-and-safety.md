# 04 — Trust & safety

Trust *is* the product. In a marketplace for physical spaces — where strangers get access to a
parking bay, a locked storage unit, or a boat berth — the platform lives or dies on whether both
sides feel safe. Every mechanism below exists to remove a specific fear.

## The fears to neutralize

| Party | Fear | Mechanism |
|-------|------|-----------|
| Renter | "I'll pay and the space won't exist / won't be usable" | Escrow, verified listings, reviews, easy refunds |
| Renter | "My stored goods / boat will be damaged or stolen" | Protection plan, verified hosts, access logs |
| Host | "A stranger will damage my space or not leave" | ID-verified renters, deposits, reviews, insurance |
| Host | "I'll break my lease by subletting" | Right-to-sublet verification, consent badges ([02](02-legal-and-compliance.md)) |
| Both | "I'll get scammed / paid off-platform" | On-platform payments + messaging, anti-leakage design |

## 1. Identity verification

- **BankID** as the primary identity anchor for both sides — near-universal in Sweden and an
  enormous trust signal. Verify at signup for hosts (needed for payouts anyway) and before first
  booking for renters.
- Tiered badges: **Verified identity**, **Verified payout account**, **Consent verified**.
- KYC on payout accounts is handled by the payment provider (Stripe/Adyen).

## 2. Payments & escrow

- **Funds held in escrow** by the payment provider and **released to the host after the booking
  starts** (or after a check-in confirmation), not at time of booking. This is the renter's core
  protection and the reason to keep everything on-platform.
- **Security deposits** (authorization hold) for higher-risk categories (storage, garages).
- **Split payments & automated payouts** via Stripe Connect / Adyen — you never touch the money.
- **Anti-leakage:** contact details revealed only after booking; nudge users to transact on-platform
  (off-platform deals lose them protection *and* lose you the fee).

## 3. Reviews & reputation

- **Two-way reviews** (host ↔ renter), released only after both submit (or a window closes) to prevent
  retaliation bias.
- Ratings feed ranking and unlock instant-book eligibility.
- **Response rate / time**, cancellation history, and tenure shown on profiles.

## 4. Insurance & guarantees

- **Protection plan** at checkout covering damage/theft up to a cap, underwritten by an insurance
  partner (revenue share — see [01](01-business-model.md)). This is the commercial answer to harms that
  ToS disclaimers can't wish away.
- **Host guarantee** for damage to the space caused by a renter.
- Start with a **partnership** (an insurer or an embedded-insurance provider) rather than underwriting
  risk yourself. Clear claims process in the ops console.

## 5. Access control (removes the key-exchange friction *and* creates an audit trail)

- **Parking:** license-plate recognition (LPR) where infrastructure exists; otherwise a printable/QR permit.
- **Garages / storage:** smart locks or keypad codes issued per booking and auto-expiring.
- **Berths:** gate/pontoon codes.
- Every access event is **logged** — invaluable for dispute resolution.

## 6. Messaging & communication

- **In-app messaging only** (no exposed phone/email pre-booking). Keeps a record for disputes,
  reduces fraud, and prevents fee circumvention.
- Automated safety prompts ("never pay outside Platsdela").

## 7. Dispute resolution

- Structured flow: report → evidence (photos, access logs, message history) → mediation → resolution
  (refund, deposit claim, insurance claim, ban).
- Clear SLAs; a premium/priority tier can be a paid feature later.

## 8. Fraud & abuse prevention

- Device/risk signals, velocity checks on new accounts, listing-photo reverse-image checks,
  duplicate-listing detection, payment fraud screening (provider + rules).
- **DSA-compliant** notice-and-action for illegal or fraudulent listings ([02](02-legal-and-compliance.md)).

---

## Trust roadmap (build in this order)

1. **MVP:** BankID identity, escrow, two-way reviews, in-app messaging, manual dispute handling, host attestation.
2. **Phase 2:** protection plan, deposits, consent-badge verification, access hardware pilots.
3. **Phase 3:** automated fraud scoring, insurance at scale, self-serve dispute tooling.
