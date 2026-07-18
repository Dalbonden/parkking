import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatSek } from "@/lib/format";
import { categoryMeta, type Listing } from "@/lib/types";

export function ListingCard({ listing }: { listing: Listing }) {
  const cat = categoryMeta(listing.category);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div
        className="relative flex h-40 items-center justify-center"
        style={{ backgroundColor: listing.swatch }}
      >
        <span className="text-5xl opacity-90" aria-hidden>
          {cat.emoji}
        </span>
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge variant="primary">{cat.label}</Badge>
          {listing.consentVerified && (
            <Badge variant="accent" title="Verifierad rätt att hyra ut">
              ✓ Samtycke
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight group-hover:text-primary">{listing.title}</h3>
          <span className="shrink-0 text-sm text-muted-foreground">★ {listing.rating.toFixed(1)}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {listing.area}, {listing.city}
        </p>
        {listing.sizeLabel && (
          <p className="text-xs text-muted-foreground">{listing.sizeLabel}</p>
        )}
        <div className="mt-1 flex flex-wrap gap-1.5">
          {listing.covered && <Badge variant="outline">Inomhus</Badge>}
          {listing.evCharging && <Badge variant="outline">Elbilsladdning</Badge>}
          {listing.access247 && <Badge variant="outline">24/7</Badge>}
        </div>
        <div className="mt-auto pt-2">
          <span className="text-lg font-bold">{formatSek(listing.pricePerMonth)}</span>
          <span className="text-sm text-muted-foreground"> / månad</span>
        </div>
      </div>
    </Link>
  );
}
