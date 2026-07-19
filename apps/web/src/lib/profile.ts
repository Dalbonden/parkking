import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IdStatus, Profile } from "./profile-types";

export type { IdStatus, Profile } from "./profile-types";
export { ID_STATUS_LABEL } from "./profile-types";

const EMPTY: Profile = {
  fullName: null,
  legalName: null,
  avatarUrl: null,
  idStatus: "unverified",
  phone: null,
  bio: null,
};

/**
 * The current user's profile. Resilient by design: if the identity columns
 * from migration 0004 aren't applied yet, this returns sensible defaults
 * instead of throwing, so the rest of the app keeps working.
 */
export async function getProfile(userId: string): Promise<Profile> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return EMPTY;

  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, legal_name, avatar_url, id_status, phone, bio")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return EMPTY;

  return {
    fullName: data.full_name ?? null,
    legalName: data.legal_name ?? null,
    avatarUrl: data.avatar_url ?? null,
    idStatus: (data.id_status ?? "unverified") as IdStatus,
    phone: data.phone ?? null,
    bio: data.bio ?? null,
  };
}
