"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { quote } from "@/lib/payments";

export interface BookingState {
  status: "idle" | "error";
  message?: string;
}

export async function createBooking(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const listingId = String(formData.get("listingId") ?? "");
  const months = Number(formData.get("months") ?? 1);

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Bokning kräver Supabase-konfiguration." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?next=/listings/${listingId}`);

  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, price_per_month, host_id")
    .eq("id", listingId)
    .maybeSingle();
  if (!listing) return { status: "error", message: "Platsen hittades inte." };
  if (listing.host_id === user.id) {
    return { status: "error", message: "Du kan inte boka din egen plats." };
  }

  const q = quote(listing.price_per_month, months);
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + q.months);
  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  const stripe = getStripe();

  if (stripe) {
    // --- Real Stripe Connect path (destination charge with application fee) ---
    const { data: hostProfile } = await supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", listing.host_id)
      .maybeSingle();

    if (!hostProfile?.stripe_account_id) {
      return { status: "error", message: "Värden har inte aktiverat utbetalningar än." };
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        listing_id: listing.id,
        renter_id: user.id,
        start_date: startDate,
        end_date: endDate,
        status: "requested",
        payment_status: "pending",
        amount_total: q.total,
        service_fee: q.renterFee,
      })
      .select("id")
      .single();
    if (error || !booking) {
      return { status: "error", message: error?.message ?? "Kunde inte skapa bokning." };
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    let checkoutUrl: string | null = null;
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${origin}/bookings?success=1`,
        cancel_url: `${origin}/listings/${listing.id}?canceled=1`,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "sek",
              unit_amount: q.total * 100, // öre
              product_data: { name: `${listing.title} — ${q.months} mån` },
            },
          },
        ],
        metadata: { booking_id: booking.id },
        payment_intent_data: {
          application_fee_amount: q.platformTake * 100,
          transfer_data: { destination: hostProfile.stripe_account_id },
          metadata: { booking_id: booking.id },
        },
      });
      checkoutUrl = session.url;
    } catch {
      return { status: "error", message: "Kunde inte starta betalningen. Försök igen." };
    }
    if (checkoutUrl) redirect(checkoutUrl);
    return { status: "error", message: "Ingen betalningssession skapades." };
  }

  // --- Demo path (no Stripe keys): create a confirmed, paid booking ---
  const { error } = await supabase.from("bookings").insert({
    listing_id: listing.id,
    renter_id: user.id,
    start_date: startDate,
    end_date: endDate,
    status: "confirmed",
    payment_status: "paid",
    amount_total: q.total,
    service_fee: q.renterFee,
  });
  if (error) return { status: "error", message: error.message };

  redirect("/bookings?success=1");
}
