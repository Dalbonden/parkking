"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
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

  // `status = active` matters: a host can read their own pending listing, so
  // without this they could book (or link someone to) an unapproved space.
  // Migration 0008 enforces the same rule in the database.
  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, price_per_month, host_id")
    .eq("id", listingId)
    .eq("status", "active")
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

  // --- Demo path (no Stripe keys) ---
  // The database forces every renter-created booking to requested/pending
  // (0008), because a user who can mark their own booking "paid" can book for
  // free. Confirming without money is a privileged act, so it goes through the
  // service role — and only when the operator has explicitly configured one.
  const { data: created, error } = await supabase
    .from("bookings")
    .insert({
      listing_id: listing.id,
      renter_id: user.id,
      start_date: startDate,
      end_date: endDate,
      amount_total: q.total,
      service_fee: q.renterFee,
    })
    .select("id")
    .single();
  if (error) return { status: "error", message: error.message };

  const admin = createSupabaseAdminClient();
  if (admin && created) {
    await admin
      .from("bookings")
      .update({ status: "confirmed", payment_status: "paid" })
      .eq("id", created.id);
    redirect("/bookings?success=1");
  }

  redirect("/bookings?requested=1");
}
