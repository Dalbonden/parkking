import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Next.js 16 renamed `middleware` to `proxy`. This refreshes the Supabase auth
 * session on every navigation: @supabase/ssr stores the session in cookies, and
 * the access token has to be rotated server-side or a signed-in user is
 * silently logged out when it expires. Follows the official @supabase/ssr
 * pattern — do NOT run other logic between createServerClient and getUser().
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Nothing to refresh when Supabase isn't configured (mock-data mode).
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touching getUser() rotates the token and writes fresh cookies onto response.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Run on pages, but skip static assets, the service worker, and images so
  // proxy work never sits in front of a CSS/JS/icon fetch.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
