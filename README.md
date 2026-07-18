# Platsdela

> A marketplace for renting out **förhyrda platser** — leased or rented spaces that people
> have the right to use but aren't using full-time: parking spaces, garage spots, storage
> units, boat slips, and more.

**Platsdela** ("share a space") lets a person who leases a space rent it out — safely, legally,
and with payments, verification, and insurance handled by the platform. Think **Airbnb for the
spaces you already pay for but don't fully use.**

> ⚠️ *"Platsdela" is a working name — see [naming options](#naming) below. Swap it freely.*

---

## The one-line pitch

Millions of people in the Nordics pay every month for a parking space, garage, storage locker, or
boat berth they only use part of the time. Platsdela turns that idle, already-paid-for space into
income — and gives renters a cheaper, more local alternative to commercial operators.

## Why now

- **Supply is idle and paid-for.** Leased parking/storage/berths are a sunk cost; owners want to recoup it.
- **Demand is structural.** Urban parking scarcity, expensive self-storage, boat-berth waiting lists.
- **The trust rails exist.** BankID, Swish, Stripe Connect, and smart-lock hardware make peer-to-peer space rental safe in a way it wasn't 10 years ago.
- **A proven analog is scaling.** [Neighbor.com](https://www.neighbor.com) (US, "Airbnb for storage") has raised >$100M validating peer-to-peer space rental.

## What makes it different

1. **Multi-asset, one trust layer.** Parking + storage + garage + boat berths under a single
   identity, payments, and insurance stack — not another single-category parking app.
2. **Compliance-first subletting.** The biggest legal risk (subletting a *leased* space) becomes a
   *trust feature*: built-in right-to-sublet / landlord-consent verification. See [docs/02](docs/02-legal-and-compliance.md).
3. **Nordic-native.** BankID identity, Swish + card payments, Swedish/Nordic tax handling
   (incl. VAT on parking), local language.
4. **B2B supply.** Housing cooperatives (BRF), property managers, and municipalities have large
   pools of idle, allocated spaces — a supply channel single-consumer apps ignore.

---

## Documentation

| # | Document | What's inside |
|---|----------|---------------|
| 01 | [Business model](docs/01-business-model.md) | Revenue streams, take rate, unit economics |
| 02 | [Legal & compliance](docs/02-legal-and-compliance.md) | Subletting law, tax/VAT, GDPR, payments regulation |
| 03 | [Product features](docs/03-product-features.md) | Web + mobile feature set, user flows |
| 04 | [Trust & safety](docs/04-trust-and-safety.md) | Verification, escrow, reviews, insurance, access control |
| 05 | [MVP roadmap](docs/05-mvp-roadmap.md) | Phased plan from validation to scale |
| 06 | [Competitors & positioning](docs/06-competitors-and-positioning.md) | Landscape and differentiation |
| 07 | [Tech architecture](docs/07-tech-architecture.md) | Recommended stack for web + app |

## Repo layout

```
platsdela/
├── README.md              ← you are here
├── docs/                  ← concept, strategy, and product documentation
├── web/                   ← Phase-0 landing page (static, self-contained)
└── .gitignore
```

## Naming

`Platsdela` is a placeholder. Other directions (check trademark + domain availability before committing):

- **Descriptive (Nordic):** Platsdela, Hyrplats, Delaplats, Platsbörsen
- **Brandable:** Spotly, Berthly, Nooky (storage-lean), Parkably
- **Category-neutral (for multi-asset):** Spacer-style names that don't lock you into parking

---

## Status

📄 **Concept & planning stage.** This repository currently holds the strategy and product docs plus a
Phase-0 landing page. Application code (see [docs/07](docs/07-tech-architecture.md)) comes in Phase 1.

*This document set is strategic guidance, not legal or tax advice. Validate the legal, tax, and
regulatory sections with a qualified Swedish advokat/revisor before launch.*
