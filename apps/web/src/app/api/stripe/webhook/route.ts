import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Stripe posts the raw body; read it as text to verify the signature.
export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return new Response("Stripe not configured", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return new Response("Admin client not configured", { status: 503 });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;
    if (!bookingId) return new Response("ok", { status: 200 });

    // `completed` does not mean paid — async methods complete while still
    // unpaid, and only `paid` should confirm a booking.
    if (session.payment_status !== "paid") {
      return new Response("ok", { status: 200 });
    }

    // Confirm Stripe collected the amount we actually charge for this booking,
    // so a tampered or replayed session can't confirm a space for less.
    const { data: booking } = await admin
      .from("bookings")
      .select("id, amount_total, payment_status")
      .eq("id", bookingId)
      .maybeSingle();
    if (!booking) return new Response("ok", { status: 200 });
    if (session.amount_total !== booking.amount_total * 100) {
      console.error(
        `webhook: amount mismatch on booking ${bookingId} — stripe ${session.amount_total} öre vs expected ${booking.amount_total * 100} öre`,
      );
      return new Response("ok", { status: 200 });
    }

    // `.eq("payment_status", "pending")` makes replays a no-op.
    await admin
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "paid",
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
      })
      .eq("id", bookingId)
      .eq("payment_status", "pending");
  }

  if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;
    if (bookingId) {
      // Release the hold so the space becomes bookable again.
      await admin
        .from("bookings")
        .update({ status: "cancelled", payment_status: "failed" })
        .eq("id", bookingId)
        .eq("payment_status", "pending");
    }
  }

  return new Response("ok", { status: 200 });
}
