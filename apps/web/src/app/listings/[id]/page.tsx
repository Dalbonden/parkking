import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPlaceholder } from "@/components/map-placeholder";
import { BookingWidget } from "@/components/booking-widget";
import { CategoryIcon, ShieldCheckIcon, ShieldIcon, StarIcon } from "@/components/icons";
import { getListing } from "@/lib/listings";
import { formatSek } from "@/lib/format";
import { categoryMeta } from "@/lib/types";
import { createBooking } from "./booking-actions";

// In Next.js 16, params is a Promise and must be awaited.
type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Plats hittades inte" };
  return { title: listing.title, description: listing.description };
}

export default async function ListingDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const cat = categoryMeta(listing.category);

  const features = [
    listing.covered ? "Inomhus / skyddad" : "Utomhus",
    listing.evCharging ? "Elbilsladdning" : null,
    listing.access247 ? "Tillgång dygnet runt" : "Begränsad tillgång",
    listing.sizeLabel,
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/listings" className="text-sm text-muted-foreground hover:text-foreground">
        ← Tillbaka till sökningen
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main */}
        <div>
          <div
            className="flex h-64 items-center justify-center rounded-xl"
            style={{ backgroundColor: listing.swatch }}
          >
            <CategoryIcon category={listing.category} className="size-24 text-white/90" strokeWidth={1.2} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge variant="primary">{cat.label}</Badge>
            {listing.consentVerified && (
              <Badge variant="accent">
                <ShieldCheckIcon className="size-3.5" /> Verifierad rätt att hyra ut
              </Badge>
            )}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <StarIcon className="size-3.5 text-amber-500" /> {listing.rating.toFixed(1)} ·{" "}
              {listing.reviewCount} omdömen
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">{listing.title}</h1>
          <p className="mt-1 text-muted-foreground">
            {listing.area}, {listing.city}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {features.map((f) => (
              <Badge key={f} variant="outline">
                {f}
              </Badge>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">Om platsen</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{listing.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="mb-2 text-lg font-semibold">Läge</h2>
            <p className="mb-3 text-sm text-muted-foreground">
              Ungefärligt läge visas innan bokning. Exakt adress delas när bokningen bekräftats.
            </p>
            <div className="h-56">
              <MapPlaceholder listings={[listing]} />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-lg font-bold text-accent-foreground">
              {listing.hostName.charAt(0)}
            </span>
            <div>
              <div className="font-medium">{listing.hostName}</div>
              <div className="text-sm text-muted-foreground">
                Verifierad med BankID · svarar oftast inom några timmar
              </div>
            </div>
          </div>
        </div>

        {/* Booking sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{formatSek(listing.pricePerMonth)}</span>
                <span className="text-muted-foreground">/ månad</span>
              </div>
              <BookingWidget
                listingId={listing.id}
                pricePerMonth={listing.pricePerMonth}
                action={createBooking}
              />
            </CardContent>
          </Card>

          <div className="mt-4 rounded-xl border border-border bg-accent/40 p-4 text-sm">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldIcon className="size-4 text-primary" /> Trygg bokning
            </div>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              <li>BankID-verifierade parter</li>
              <li>Betalning via escrow</li>
              <li>Skydd mot skador ingår</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
