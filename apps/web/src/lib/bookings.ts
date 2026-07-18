import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category } from "./types";

export interface BookingView {
  id: string;
  status: string;
  paymentStatus: string;
  startDate: string;
  endDate: string;
  amountTotal: number;
  serviceFee: number;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    area: string;
    city: string;
    category: Category;
  } | null;
}

type EmbeddedListing = {
  id: string;
  title: string;
  area: string;
  city: string;
  category: Category;
};

interface BookingRow {
  id: string;
  status: string;
  payment_status: string;
  start_date: string;
  end_date: string;
  amount_total: number;
  service_fee: number;
  created_at: string;
  listing?: EmbeddedListing | EmbeddedListing[] | null;
  listings?: EmbeddedListing | EmbeddedListing[] | null;
}

const SELECT =
  "id, status, payment_status, start_date, end_date, amount_total, service_fee, created_at, listing:listings(id, title, area, city, category)";

function rowToBooking(row: BookingRow): BookingView {
  const embed = row.listing ?? row.listings ?? null;
  const listing = Array.isArray(embed) ? embed[0] : embed;
  return {
    id: row.id,
    status: row.status,
    paymentStatus: row.payment_status,
    startDate: row.start_date,
    endDate: row.end_date,
    amountTotal: row.amount_total,
    serviceFee: row.service_fee,
    createdAt: row.created_at,
    listing: listing ?? null,
  };
}

/** Bookings the given user has made as a renter. */
export async function getBookingsForRenter(renterId: string): Promise<BookingView[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select(SELECT)
    .eq("renter_id", renterId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as BookingRow[]).map(rowToBooking);
}

/** Incoming bookings on listings owned by the given host. */
export async function getBookingsForHost(hostId: string): Promise<BookingView[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, status, payment_status, start_date, end_date, amount_total, service_fee, created_at, listings!inner(id, title, area, city, category, host_id)",
    )
    .eq("listings.host_id", hostId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as BookingRow[]).map(rowToBooking);
}
