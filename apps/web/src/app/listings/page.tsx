import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchFilters } from "@/components/search-filters";
import { ListingCard } from "@/components/listing-card";
import { MapPlaceholder } from "@/components/map-placeholder";
import { getListings } from "@/lib/listings";
import type { Category, ListingFilters } from "@/lib/types";

export const metadata: Metadata = {
  title: "Hitta plats",
  description: "Sök bland förhyrda parkeringsplatser, garage, förråd och båtplatser.",
};

const VALID: Category[] = ["parking", "garage", "storage", "boat"];

// In Next.js 16, searchParams is a Promise and must be awaited.
type SearchParams = Promise<{ category?: string; q?: string; maxPrice?: string }>;

export default async function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const filters: ListingFilters = {
    category: VALID.includes(sp.category as Category) ? (sp.category as Category) : undefined,
    q: sp.q || undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
  };

  const listings = await getListings(filters);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Hitta en plats</h1>
      <p className="mt-1 text-muted-foreground">
        {listings.length} {listings.length === 1 ? "plats" : "platser"} tillgängliga
      </p>

      <div className="mt-6">
        <Suspense fallback={<div className="h-24" />}>
          <SearchFilters />
        </Suspense>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              Inga platser matchade din sökning. Prova att ta bort filter.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
          <MapPlaceholder listings={listings} />
        </aside>
      </div>
    </div>
  );
}
