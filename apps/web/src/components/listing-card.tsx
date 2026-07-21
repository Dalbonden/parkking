import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon, ShieldCheckIcon, StarIcon } from "@/components/icons";
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
        className="relative flex h-40 items-center justify-center overflow-hidden"
        style={{ backgroundColor: listing.swatch }}
      >
        {listing.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.coverUrl}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <CategoryIcon
            category={listing.category}
            className="size-14 text-white/90"
            strokeWidth={1.4}
          />
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge variant="primary">{cat.label}</Badge>
          {listing.consentVerified && (
            <Badge variant="accent" title="Verifierad rätt att hyra ut">
              <ShieldCheckIcon className="size-3.5" /> Samtycke
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight group-hover:text-primary">{listing.title}</h3>
          <span className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
            <StarIcon className="size-3.5 text-amber-500" />
            {listing.rating.toFixed(1)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {listing.area}, {listing.city}
        </p>
        {listing.sizeLabel && <p className="text-xs text-muted-foreground">{listing.sizeLabel}</p>}
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
