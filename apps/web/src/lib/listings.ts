import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { MOCK_LISTINGS } from "./mock-data";
import { categorySwatch, type Category, type Listing, type ListingFilters } from "./types";

// Shape of a row returned from Supabase (snake_case + embedded host profile).
interface ListingRow {
  id: string;
  category: Category;
  title: string;
  description: string | null;
  city: string;
  area: string;
  price_per_month: number;
  size_label: string | null;
  covered: boolean;
  ev_charging: boolean;
  access_247: boolean;
  consent_verified: boolean;
  lat: number | null;
  lng: number | null;
  rating: number;
  review_count: number;
  cover_url: string | null;
  created_at: string;
  host: { full_name: string | null } | { full_name: string | null }[] | null;
}

const SELECT =
  "id, category, title, description, city, area, price_per_month, size_label, covered, ev_charging, access_247, consent_verified, lat, lng, rating, review_count, cover_url, created_at, host:profiles(full_name)";

function rowToListing(row: ListingRow): Listing {
  const host = Array.isArray(row.host) ? row.host[0] : row.host;
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    city: row.city,
    area: row.area,
    pricePerMonth: row.price_per_month,
    sizeLabel: row.size_label ?? undefined,
    covered: row.covered,
    evCharging: row.ev_charging,
    access247: row.access_247,
    consentVerified: row.consent_verified,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    hostName: host?.full_name ?? "Värd",
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    description: row.description ?? "",
    swatch: categorySwatch(row.category),
    coverUrl: row.cover_url ?? undefined,
    createdAt: row.created_at,
  };
}

function matchesMock(listing: Listing, filters: ListingFilters): boolean {
  if (filters.category && listing.category !== filters.category) return false;
  if (filters.maxPrice && listing.pricePerMonth > filters.maxPrice) return false;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    const hay = `${listing.title} ${listing.city} ${listing.area} ${listing.description}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function mockListings(filters: ListingFilters): Listing[] {
  return MOCK_LISTINGS.filter((l) => matchesMock(l, filters)).sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

/** List active spaces, optionally filtered. Uses Supabase when configured. */
export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  if (!isSupabaseConfigured) return mockListings(filters);

  const supabase = await createSupabaseServerClient();
  if (!supabase) return mockListings(filters);

  let query = supabase.from("listings").select(SELECT).eq("status", "active");
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.maxPrice) query = query.lte("price_per_month", filters.maxPrice);
  if (filters.q) {
    const q = filters.q.replace(/[%,()]/g, " ");
    query = query.or(
      `title.ilike.%${q}%,area.ilike.%${q}%,city.ilike.%${q}%,description.ilike.%${q}%`,
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error || !data) {
    console.error("getListings: falling back to mock data —", error?.message);
    return mockListings(filters);
  }
  return (data as unknown as ListingRow[]).map(rowToListing);
}

/** All listings owned by a host, any status (for the host dashboard). */
export async function getListingsForHost(hostId: string): Promise<Listing[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .eq("host_id", hostId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as ListingRow[]).map(rowToListing);
}

export async function getListing(id: string): Promise<Listing | null> {
  if (!isSupabaseConfigured) return MOCK_LISTINGS.find((l) => l.id === id) ?? null;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return MOCK_LISTINGS.find((l) => l.id === id) ?? null;

  const { data, error } = await supabase.from("listings").select(SELECT).eq("id", id).maybeSingle();
  if (error || !data) return null;
  return rowToListing(data as unknown as ListingRow);
}

/** A few high-rated listings for the home page. */
export async function getFeaturedListings(limit = 4): Promise<Listing[]> {
  if (!isSupabaseConfigured) {
    return [...MOCK_LISTINGS].sort((a, b) => b.rating - a.rating).slice(0, limit);
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return [...MOCK_LISTINGS].sort((a, b) => b.rating - a.rating).slice(0, limit);

  const { data, error } = await supabase
    .from("listings")
    .select(SELECT)
    .eq("status", "active")
    .order("rating", { ascending: false })
    .limit(limit);
  if (error || !data) {
    return [...MOCK_LISTINGS].sort((a, b) => b.rating - a.rating).slice(0, limit);
  }
  return (data as unknown as ListingRow[]).map(rowToListing);
}
