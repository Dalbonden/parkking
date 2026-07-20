"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import type { AdminActionState } from "@/lib/admin-types";

// Every action re-checks requireAdmin(): the page gate is not enough, because a
// server action is a POST endpoint anyone can call directly. The database is
// the real backstop — RLS + the 0008/0010 triggers only let an admin (or the
// service role) touch these columns — but we fail fast and cleanly here too.

export async function approveListing(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctx = await requireAdmin();
  if (!ctx) return { status: "error", message: "Behörighet saknas." };

  const id = String(formData.get("listingId") ?? "");
  const { error } = await ctx.supabase
    .from("listings")
    .update({ moderation_approved: true, status: "active" })
    .eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath("/");
  return { status: "success", message: "Platsen är godkänd och publicerad." };
}

export async function rejectListing(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctx = await requireAdmin();
  if (!ctx) return { status: "error", message: "Behörighet saknas." };

  const id = String(formData.get("listingId") ?? "");
  const { error } = await ctx.supabase
    .from("listings")
    .update({ status: "removed" })
    .eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin");
  return { status: "success", message: "Platsen är avvisad." };
}

export async function approveIdentity(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctx = await requireAdmin();
  if (!ctx) return { status: "error", message: "Behörighet saknas." };

  const userId = String(formData.get("userId") ?? "");
  const { error } = await ctx.supabase
    .from("profiles")
    .update({ id_status: "verified", is_id_verified: true })
    .eq("id", userId);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin");
  return { status: "success", message: "Identiteten är verifierad." };
}

export async function rejectIdentity(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const ctx = await requireAdmin();
  if (!ctx) return { status: "error", message: "Behörighet saknas." };

  const userId = String(formData.get("userId") ?? "");
  const { error } = await ctx.supabase
    .from("profiles")
    .update({ id_status: "rejected", is_id_verified: false })
    .eq("id", userId);
  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin");
  return { status: "success", message: "Identiteten är avvisad." };
}
