import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./env";

/**
 * Service-role Supabase client — bypasses RLS. Use ONLY in trusted server
 * contexts (e.g. the Stripe webhook), never in code reachable by the browser.
 * Returns null when SUPABASE_SERVICE_ROLE_KEY isn't configured.
 */
export function createSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
