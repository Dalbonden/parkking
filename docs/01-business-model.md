# 01 — Business model

## The core: a transaction marketplace

Platsdela makes money when a space gets booked. Everything else is secondary. The primary lever is
a **service fee (take rate)** on each booking, split between the two sides.

### Primary revenue: booking service fee

A common, defensible structure (benchmarked against Airbnb ~14–16% blended, Neighbor, JustPark):

| Fee | Who pays | Typical range | Notes |
|-----|----------|---------------|-------|
| **Host service fee** | The lister | 8–15% of payout | Deducted before payout |
| **Renter service fee** | The booker | 5–12% of booking | Shown at checkout |
| **Blended take rate** | — | **15–25%** | Your actual margin per transaction |

Start on the higher end while volume is low (you need margin to fund trust/insurance), then compete
on price as liquidity grows. Parking is high-frequency and low-ticket, so favour a **percentage +
small fixed minimum** (e.g., 15% or 5 SEK, whichever is greater) to stay profitable on cheap bookings.

### Secondary revenue streams

1. **Payment processing spread.** Pass through Stripe/Swish cost with a thin markup, or absorb it and
   price it into the take rate.
2. **Subscriptions for power hosts.** Property managers and BRFs with many spaces pay a monthly fee
   (e.g., 199–999 SEK/mo) for a management dashboard, bulk listing, lower per-booking fees, and analytics.
3. **Featured / promoted listings.** Pay to rank higher in a location — classic marketplace ads revenue.
4. **Protection plan attach.** An optional damage/theft protection add-on at checkout, with a revenue
   share from the underwriting insurer (see [04](04-trust-and-safety.md)).
5. **Access hardware.** Resell or lease smart locks, QR/keypad units, or LPR (license-plate) integration
   for garages/storage — plus a small recurring SaaS fee.
6. **B2B / white-label.** License the booking + payments + access stack to a parking operator, marina,
   or municipality under their brand.
7. **Value-added services.** Premium dispute handling, professional listing photography, signage.

> **Sequencing matters.** Streams 1–3 are natural extensions of the marketplace. Streams 4–7 are
> monetization you layer on *after* liquidity exists. Don't build them in the MVP.

## Unit economics (illustrative)

Assume an average monthly parking sublet at **1,500 SEK/mo** and a **20% blended take rate**:

- Gross revenue per active listing/month: **300 SEK**
- Payment processing (~2.5%): **~38 SEK**
- Support/ops/insurance reserve (assume ~8%): **~120 SEK**
- **Contribution margin ≈ 140 SEK / listing / month**

Storage and boat berths are higher-ticket and lower-churn (better economics); short-stay parking is
lower-ticket but higher-frequency (more transactions, more fee events). A healthy mix balances the two.

**The whole game is liquidity.** A marketplace is worthless until a searcher reliably finds a nearby
space and a lister reliably finds a renter. Concentrate all early spend on making *one geography ×
one category* liquid before expanding. See [05 — MVP roadmap](05-mvp-roadmap.md).

## Key metrics to run the business on

- **Liquidity:** search-to-book conversion; % of listings booked within 14 days.
- **Supply:** new listings/week; active listings; supply by neighborhood.
- **Demand:** searches/week; unique searchers; repeat search rate.
- **GMV** (gross merchandise value) and **net revenue** (your fees).
- **Take rate** (net revenue ÷ GMV).
- **Retention:** host month-2 payout retention; renter repeat-booking rate.
- **CAC vs. LTV** per side of the market.

## Pricing philosophy

- **Free to list.** Charge on success only — removes friction from building supply.
- **Transparent fees at checkout.** Hidden fees kill trust in a trust business.
- **Dynamic pricing guidance, not control.** Suggest prices from local comps; let hosts set the number.
