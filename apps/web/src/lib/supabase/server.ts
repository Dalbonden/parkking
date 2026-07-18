import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Server Supabase client for Server Components, Route Handlers and Server
 * Actions. Returns `null` when the project isn't configured yet.
 *
 * Note: in Next.js 16 `cookies()` is async and must be awaited.
 */
export async function createSupabaseServerClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `setAll` can be called from a Server Component where cookies are
          // read-only. Safe to ignore when middleware refreshes the session.
        }
      },
    },
  });
}
