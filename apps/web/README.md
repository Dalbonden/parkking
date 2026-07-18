# Platsdela — web app

The Next.js 16 (App Router) PWA for Platsdela. Runs on **mock data with zero config**, and is wired
to swap in Supabase, Stripe, Mapbox and BankID via environment variables.

## Stack

- **Next.js 16** (App Router, Turbopack, React 19) + **TypeScript**
- **Tailwind CSS v4** + shadcn-style UI primitives (`src/components/ui`)
- **Supabase** (Postgres + PostGIS + Auth) — clients in `src/lib/supabase`, schema in `../../supabase/migrations`
- **PWA** — `src/app/manifest.ts` + `public/sw.js`

See the strategy behind these choices in [`../../docs`](../../docs).

## Getting started

```bash
npm install
npm run dev         # http://localhost:3000
```

The app is fully browsable without any backend. To connect real services, copy `.env.example`
to `.env.local` and fill in the values.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `node scripts/generate-icons.mjs` | Regenerate PWA icons |

## Project layout

```
src/
├── app/                  # routes (App Router)
│   ├── page.tsx          # home
│   ├── listings/         # search + detail ([id])
│   ├── list-space/       # create a listing (server action + form)
│   ├── sign-in/          # auth stub (BankID/email)
│   ├── dashboard/        # host overview stub
│   └── manifest.ts       # PWA manifest
├── components/
│   ├── ui/               # Button, Card, Badge, Input, ...
│   └── *.tsx             # header, footer, listing card, filters, map
└── lib/
    ├── listings.ts       # data access (mock → Supabase)
    ├── mock-data.ts      # seed listings
    ├── types.ts          # domain types
    └── supabase/         # server + browser clients
```

## Connecting Supabase

1. Create an **EU-region** Supabase project.
2. Run [`../../supabase/migrations/0001_init.sql`](../../supabase/migrations/0001_init.sql) (SQL editor or CLI).
3. Put the project URL + anon key in `.env.local`.
4. Replace the mock source in `src/lib/listings.ts` with the Supabase query shown in the comments.

## What's stubbed (intentionally, for the MVP scaffold)

- **BankID** sign-in (button present; provider integration per docs/07)
- **Stripe Connect** payments/escrow (fee math shown; no charges)
- **Mapbox** (schematic map until `NEXT_PUBLIC_MAPBOX_TOKEN` is set)
- **Persistence** (listings save only when Supabase is connected)

These are the deliberate Phase-1 boundaries — see [`../../docs/05-mvp-roadmap.md`](../../docs/05-mvp-roadmap.md).
