"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface CancelState {
  status: "idle" | "success" | "error";
  message?: string;
}

export async function cancelBooking(
  _prev: CancelState,
  formData: FormData,
): Promise<CancelState> {
  const id = String(formData.get("bookingId") ?? "");
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Kräver Supabase-konfiguration." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Logga in först." };

  // RLS limits this to bookings the user participates in; the DB trigger only
  // permits requested/confirmed → cancelled. We read the effective status back
  // so we don't report success when the trigger left it unchanged.
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select("status")
    .maybeSingle();
  if (error) return { status: "error", message: error.message };
  if (!data) return { status: "error", message: "Bokningen hittades inte." };
  if (data.status !== "cancelled") {
    return { status: "error", message: "Den här bokningen kan inte avbokas längre." };
  }

  revalidatePath("/bookings");
  revalidatePath("/dashboard");
  return { status: "success", message: "Bokningen är avbokad." };
}
