import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** The currently signed-in user, or null. Safe to call anywhere on the server. */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
