"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";

export interface CreateListingState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
}

const VALID_CATEGORIES: Category[] = ["parking", "garage", "storage", "boat"];

export async function createListing(
  _prev: CreateListingState,
  formData: FormData,
): Promise<CreateListingState> {
  const category = String(formData.get("category") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const area = String(formData.get("area") ?? "").trim();
  const price = Number(formData.get("pricePerMonth") ?? 0);
  const attest = formData.get("attestation") === "on";

  const errors: Record<string, string> = {};
  if (!VALID_CATEGORIES.includes(category as Category)) errors.category = "Välj en kategori.";
  if (title.length < 4) errors.title = "Ange en beskrivande rubrik.";
  if (!city) errors.city = "Ange stad.";
  if (!area) errors.area = "Ange område.";
  if (!Number.isFinite(price) || price <= 0) errors.pricePerMonth = "Ange ett giltigt pris.";
  if (!attest) errors.attestation = "Du måste intyga att du har rätt att hyra ut platsen.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Kontrollera fälten nedan.", errors };
  }

  // Persist to Supabase only when a host is authenticated (RLS requires
  // host_id = auth.uid()). Until BankID sign-in is wired, there's no session,
  // so we acknowledge without persisting.
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from("listings").insert({
        host_id: user.id,
        category,
        title,
        city,
        area,
        price_per_month: price,
        covered: formData.get("covered") === "on",
        ev_charging: formData.get("evCharging") === "on",
        access_247: formData.get("access247") === "on",
        description: String(formData.get("description") ?? "").trim(),
        status: "pending_review",
      });
      if (error) {
        return { status: "error", message: `Kunde inte spara: ${error.message}` };
      }
      // Saved — send the host to their dashboard to see the new listing.
      revalidatePath("/dashboard");
      redirect("/dashboard");
    }
  }

  // No session yet (sign-in is stubbed): acknowledge without persisting.
  return {
    status: "success",
    message:
      "Tack! Din plats är validerad. När BankID-inloggning är aktiv sparas den i databasen och skickas för granskning.",
  };
}
