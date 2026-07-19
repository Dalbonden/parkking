import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ReviewView {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  authorName: string;
}

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  author: { full_name: string | null } | { full_name: string | null }[] | null;
}

/**
 * Reviews for a listing, resolved two hops: reviews → bookings → listing.
 * `author:profiles!author_id` disambiguates the author FK from target_id.
 */
export async function getReviewsForListing(listingId: string): Promise<ReviewView[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, created_at, author:profiles!author_id(full_name), bookings!inner(listing_id)",
    )
    .eq("bookings.listing_id", listingId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  return (data as unknown as ReviewRow[]).map((r) => {
    const a = Array.isArray(r.author) ? r.author[0] : r.author;
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      authorName: a?.full_name ?? "Anonym",
    };
  });
}

/** Booking ids the user has already reviewed (to hide the form). */
export async function getReviewedBookingIds(authorId: string): Promise<string[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("booking_id")
    .eq("author_id", authorId);
  if (error || !data) return [];
  return (data as { booking_id: string }[]).map((r) => r.booking_id);
}
