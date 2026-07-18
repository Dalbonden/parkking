import { MOCK_LISTINGS } from "./mock-data";
import type { Listing, ListingFilters } from "./types";

function matches(listing: Listing, filters: ListingFilters): boolean {
  if (filters.category && listing.category !== filters.category) return false;
  if (filters.maxPrice && listing.pricePerMonth > filters.maxPrice) return false;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    const hay = `${listing.title} ${listing.city} ${listing.area} ${listing.description}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

/**
 * List spaces, optionally filtered. Currently backed by seed data so the app
 * runs with no configuration.
 *
 * When a Supabase project is connected, swap the mock source for a query, e.g.:
 *
 *   const supabase = await createSupabaseServerClient();
 *   let query = supabase.from("listings").select("*").eq("status", "active");
 *   if (filters.category) query = query.eq("category", filters.category);
 *   const { data } = await query.order("created_at", { ascending: false });
 *   return (data ?? []) as Listing[];
 */
export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  return MOCK_LISTINGS.filter((l) => matches(l, filters)).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function getListing(id: string): Promise<Listing | null> {
  return MOCK_LISTINGS.find((l) => l.id === id) ?? null;
}

/** A few high-rated listings for the home page. */
export async function getFeaturedListings(limit = 4): Promise<Listing[]> {
  return [...MOCK_LISTINGS].sort((a, b) => b.rating - a.rating).slice(0, limit);
}
