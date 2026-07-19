import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listing-card";
import {
  CategoryIcon,
  CreditCardIcon,
  LockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  ShieldIcon,
  StarIcon,
} from "@/components/icons";
import { getFeaturedListings } from "@/lib/listings";
import { CATEGORIES } from "@/lib/types";

const TRUST = [
  { Icon: LockIcon, label: "ID-verifiering" },
  { Icon: CreditCardIcon, label: "Trygg betalning & escrow" },
  { Icon: StarIcon, label: "Omdömen åt båda håll" },
  { Icon: ShieldIcon, label: "Skydd mot skador" },
  { Icon: ShieldCheckIcon, label: "Verifierad rätt att hyra ut" },
];

const STEPS = [
  {
    n: 1,
    title: "Lägg upp din plats",
    body: "Verifiera din identitet och intyga att du får hyra ut den. Sätt pris och tillgänglighet.",
  },
  {
    n: 2,
    title: "Få en förfrågan",
    body: "Godkänn hyresgäster du litar på, eller slå på direktbokning. All kommunikation sker i appen.",
  },
  {
    n: 3,
    title: "Få betalt tryggt",
    body: "Betalningen hålls säkert och betalas ut automatiskt. Vi sköter det administrativa.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedListings(4);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 text-center sm:pt-20">
        <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <MapPinIcon className="size-3.5 text-primary" /> Nordisk marknadsplats för förhyrda platser
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          Hyr ut platsen du <span className="text-primary">redan betalar för</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Parkeringsplatser, garage, förråd och båtplatser står oanvända — fastän någon betalar för
          dem varje månad. Platsdela gör din lediga plats till en trygg inkomst.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/listings">Hitta en plats</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/list-space">Hyr ut din plats</Link>
          </Button>
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {TRUST.map((t) => (
            <span key={t.label} className="inline-flex items-center gap-1.5">
              <t.Icon className="size-4 text-primary" />
              {t.label}
            </span>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/listings?category=${c.key}`}
              className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <CategoryIcon category={c.key} className="size-8 text-primary" />
              <div className="mt-3 font-semibold group-hover:text-primary">{c.label}</div>
              <div className="text-sm text-muted-foreground">{c.gloss}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Populära platser</h2>
          <Button variant="link" asChild>
            <Link href="/listings">Visa alla →</Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center text-2xl font-bold tracking-tight">Så funkar det</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <span className="grid size-9 place-items-center rounded-full bg-accent font-bold text-accent-foreground">
                  {s.n}
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Har du en plats som står tom?</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Det är gratis att lägga upp. Du betalar bara en serviceavgift när platsen faktiskt bokas.
        </p>
        <Button size="lg" className="mt-6" asChild>
          <Link href="/list-space">Kom igång</Link>
        </Button>
      </section>
    </div>
  );
}
