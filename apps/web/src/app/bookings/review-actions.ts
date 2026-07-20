"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ReviewState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function createReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const bookingId = String(formData.get("bookingId") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 2000);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { status: "error", message: "Välj ett betyg mellan 1 och 5." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Omdömen kräver Supabase-konfiguration." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Logga in för att lämna omdöme." };

  // Confirm the booking is the reviewer's, and find the host (review target).
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, renter_id, listing:listings(host_id)")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking || booking.renter_id !== user.id) {
    return { status: "error", message: "Bokningen hittades inte." };
  }
  const listing = Array.isArray(booking.listing) ? booking.listing[0] : booking.listing;
  const targetId = listing?.host_id;
  if (!targetId) return { status: "error", message: "Kunde inte hitta värden." };

  const { error } = await supabase.from("reviews").insert({
    booking_id: bookingId,
    author_id: user.id,
    target_id: targetId,
    rating,
    comment: comment || null,
  });
  if (error) return { status: "error", message: error.message };

  revalidatePath("/bookings");
  return { status: "success", message: "Tack för ditt omdöme!" };
}
