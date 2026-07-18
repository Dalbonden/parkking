# 02 — Legal & compliance

> **This is not legal advice.** It maps the legal *terrain* so you know what to ask a qualified
> Swedish **advokat** and **revisor** about before launch. Every point below needs professional
> verification for your specific model and jurisdiction. The single biggest existential risk to this
> business is legal, not technical — treat this document as a checklist for your lawyer, not a
> substitute for one.

---

## 1. The central risk: subletting a *leased* space (andrahandsuthyrning)

Your differentiator — renting out spaces people **lease** rather than **own** — is also your biggest
legal exposure. In Sweden, subletting (*andrahandsuthyrning*) a rented space almost always requires
the **primary landlord's consent**.

| Space type | Who typically controls consent | Common restriction |
|-----------|-------------------------------|--------------------|
| Rented parking / garage (fristående) | Landlord or parking company | Sublet often prohibited or needs written OK |
| Parking tied to a rental apartment | Landlord | Follows the tenancy's sublet rules |
| Parking in a housing coop (BRF) | The BRF (bostadsrättsförening) | Association bylaws (stadgar) govern |
| Storage unit / förråd | Landlord / storage operator | Contract terms |
| Boat berth (båtplats) | Municipality or boat club, often waiting-list allocated | Frequently non-transferable; sublet may forfeit the berth |

**Design principle: turn the risk into a feature.** Build consent into the listing flow so the
platform never *facilitates a breach it knows about*:

1. **Attestation gate.** Before a listing goes live, the host must affirmatively confirm they have the
   right to sublet (checkbox + timestamp + BankID-signed).
2. **Evidence upload (tiered).** Optionally upload the lease clause permitting sublet, or written
   landlord/BRF consent — unlocks a "Consent verified" trust badge and higher ranking.
3. **Category-specific warnings.** For boat berths and BRF parking especially, warn the host that
   unauthorized subletting can forfeit their own contract.
4. **Clear ToS allocation.** Terms state the *host* is solely responsible for having the right to
   sublet, and indemnifies the platform. (This is not a magic shield — see §6 — but it's necessary.)

> **Strategic note:** A sizeable share of leased parking/storage contracts *do* permit subletting or
> the landlord doesn't object. And **BRFs and property managers are a huge, clean supply source** —
> they *are* the landlord, so consent is automatic. Prioritizing B2B supply (see [01](01-business-model.md)
> and [06](06-competitors-and-positioning.md)) largely sidesteps the consent problem.

## 2. Tax

### For hosts (the people earning)

- Rental income is **taxable income** and hosts are responsible for declaring it.
- Sweden's **schablonavdrag (~40,000 SEK/yr)** for renting out a *private residence* (privatbostad)
  may apply when the space is part of the host's home — but **standalone parking/storage may be
  treated differently**. Verify per-case with a revisor.
- **VAT (moms) is the sharp edge for parking.** In Sweden, letting a parking space is generally
  **VAT-liable at 25%**, *unless* it's ancillary to a VAT-exempt residential letting. This materially
  affects pricing and whether hosts (especially B2B ones) must charge and remit VAT. **Get this right
  early — it changes your checkout math.**

### For the platform

- **DAC7 reporting.** As an EU digital platform intermediating rentals, you likely fall under **DAC7**
  (EU Directive 2021/514): you must **collect seller info and report host earnings to Skatteverket**.
  Build data collection for this into onboarding from day one — retrofitting it is painful.
- Your own corporate tax, and VAT treatment of *your service fee*.

## 3. Payments regulation

- **Don't hold funds yourself.** Handling escrow directly can make you a regulated payment institution
  under **PSD2**. Instead use a licensed provider — **Stripe Connect** (with Custom/Express connected
  accounts) or **Adyen for Platforms** — so *they* are the money-handler of record. Swish can be added
  for local UX.
- **KYC/AML.** The payment provider runs KYC on hosts receiving payouts. You must support their
  verification flow (ID, bank account, business info for companies).
- **Strong Customer Authentication (SCA).** Required under PSD2 for card payments — handled by the provider.

## 4. Data protection (GDPR)

- You process personal data (identity, location, payments, messages, sometimes license plates).
  **License plates and precise location are sensitive** — minimize, encrypt, and set retention limits.
- Requirements: lawful basis for each processing purpose, privacy policy, DPO consideration, data
  subject rights (access/erasure), **data processing agreements** with every subprocessor
  (Stripe, hosting, maps, ID provider), and breach notification.
- Prefer **EU data residency** (e.g., EU-hosted Supabase/Vercel regions) to simplify transfers.

## 5. Consumer & e-commerce law

- **Distansavtalslagen** (Distance Contracts Act) and EU consumer rules apply to consumer-facing terms.
- Clear, fair **Terms of Service** and **cancellation/refund policy**.
- **Platform-to-Business (P2B) Regulation (EU 2019/1150):** transparency obligations toward the hosts
  (your business users) — ranking criteria, suspension reasons, complaint handling.
- Marketing/consumer protection rules for how you present prices (all-in pricing incl. fees/VAT).

## 6. Liability & the platform's legal position

- **Be an intermediary, not a party** to the rental. Terms should state Platsdela connects hosts and
  renters and is not the lessor, doesn't own/control spaces, and isn't party to the rental contract.
- **But intermediary status is not absolute immunity.** Under the EU **Digital Services Act (DSA)** and
  consumer law, platforms have due-diligence, notice-and-action, and transparency duties, and can bear
  responsibility where they actively facilitate known illegality. This is exactly why the §1 consent
  design and honest ToS matter.
- **Insurance** (see [04](04-trust-and-safety.md)) covers the practical harm (damage/theft) that ToS
  disclaimers cannot make disappear commercially.

---

## Compliance checklist for launch

- [ ] Advokat review of the subletting/consent model and host attestation flow
- [ ] Revisor review of host tax guidance and **VAT-on-parking** handling in checkout
- [ ] DAC7 seller data collection + Skatteverket reporting pipeline
- [ ] Payment provider selected (Stripe Connect / Adyen) — you never touch escrow directly
- [ ] KYC/AML flow via provider
- [ ] GDPR: privacy policy, DPAs with all subprocessors, retention + minimization for plates/location
- [ ] ToS, cancellation/refund policy, P2B transparency terms
- [ ] DSA notice-and-action / illegal-content reporting mechanism
- [ ] Insurance / protection product terms agreed with underwriter
