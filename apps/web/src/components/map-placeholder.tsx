import { CategoryIcon } from "@/components/icons";
import type { Listing } from "@/lib/types";

/**
 * Lightweight schematic map. Plots listing pins by lat/lng without any external
 * map SDK or token, so the search UX is visible out of the box. Replace with
 * Mapbox GL (NEXT_PUBLIC_MAPBOX_TOKEN) for the real product.
 */
export function MapPlaceholder({ listings }: { listings: Listing[] }) {
  const lats = listings.map((l) => l.lat);
  const lngs = listings.map((l) => l.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const pos = (lat: number, lng: number) => {
    const pad = 12;
    const span = 100 - pad * 2;
    const x = maxLng === minLng ? 50 : pad + ((lng - minLng) / (maxLng - minLng)) * span;
    const y = maxLat === minLat ? 50 : pad + ((maxLat - lat) / (maxLat - minLat)) * span;
    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="relative h-full min-h-64 w-full overflow-hidden rounded-xl border border-border bg-accent">
      {/* faux grid */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />
      {listings.map((l) => (
        <div
          key={l.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={pos(l.lat, l.lng)}
          title={`${l.title} — ${l.area}`}
        >
          <span className="grid size-8 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md">
            <CategoryIcon category={l.category} className="size-4" />
          </span>
        </div>
      ))}
      <div className="absolute bottom-2 right-2 rounded-md bg-card/90 px-2 py-1 text-[11px] text-muted-foreground">
        Schematisk karta · Mapbox i produktion
      </div>
    </div>
  );
}
