import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category } from "./types";
import type { ModerationQueue, PendingIdentity } from "./admin-types";

export type {
  AdminActionState,
  ModerationQueue,
  PendingIdentity,
  PendingListing,
} from "./admin-types";

export interface AdminContext {
  supabase: SupabaseClient;
  userId: string;
}

/**
 * Returns an authenticated admin's client + id, or null. "Admin" is a database
 * fact (a row in public.admins, seedable only by a privileged connection — see
 * migration 0010), so this can't be spoofed from the client. Every admin page
 * and server action gates on this — not just the page, so a direct POST to an
 * action is checked too.
 */
export async function requireAdmin(): Promise<AdminContext | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Passes RLS "see own admin row"; a non-admin gets no row.
  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) return null;

  return { supabase, userId: user.id };
}

/** Lightweight check for the header nav. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  return (await requireAdmin()) !== null;
}

interface ListingQueueRow {
  id: string;
  title: string;
  category: Category;
  city: string;
  area: string;
  price_per_month: number;
  description: string | null;
  consent_verified: boolean;
  created_at: string;
  host: { full_name: string | null; legal_name: string | null; id_status: string | null }
    | { full_name: string | null; legal_name: string | null; id_status: string | null }[]
    | null;
}

interface IdentityQueueRow {
  id: string;
  full_name: string | null;
  legal_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  id_document_path: string | null;
  created_at: string;
}

/**
 * The moderation queue: listings awaiting review and identities awaiting
 * verification. Reads succeed because migration 0010 grants admins RLS access
 * across the moderation surface; ID documents get short-lived signed URLs so
 * the reviewer can see them without making the bucket public.
 */
export async function getModerationQueue(supabase: SupabaseClient): Promise<ModerationQueue> {
  const { data: listingRows } = await supabase
    .from("listings")
    .select(
      "id, title, category, city, area, price_per_month, description, consent_verified, created_at, host:profiles(full_name, legal_name, id_status)",
    )
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  const listings = ((listingRows ?? []) as ListingQueueRow[]).map((r) => {
    const host = Array.isArray(r.host) ? r.host[0] : r.host;
    return {
      id: r.id,
      title: r.title,
      category: r.category,
      city: r.city,
      area: r.area,
      pricePerMonth: r.price_per_month,
      description: r.description,
      consentVerified: r.consent_verified,
      createdAt: r.created_at,
      hostName: host?.full_name ?? null,
      hostLegalName: host?.legal_name ?? null,
      hostIdStatus: host?.id_status ?? "unverified",
    };
  });

  const { data: idRows } = await supabase
    .from("profiles")
    .select("id, full_name, legal_name, phone, avatar_url, id_document_path, created_at")
    .eq("id_status", "pending")
    .order("created_at", { ascending: true });

  const identities: PendingIdentity[] = [];
  for (const r of (idRows ?? []) as IdentityQueueRow[]) {
    let docUrl: string | null = null;
    if (r.id_document_path) {
      const { data: signed } = await supabase.storage
        .from("id-documents")
        .createSignedUrl(r.id_document_path, 300); // 5 minutes
      docUrl = signed?.signedUrl ?? null;
    }
    identities.push({
      userId: r.id,
      fullName: r.full_name,
      legalName: r.legal_name,
      phone: r.phone,
      avatarUrl: r.avatar_url,
      docUrl,
      createdAt: r.created_at,
    });
  }

  return { listings, identities };
}
