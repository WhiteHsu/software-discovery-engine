import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getSupabasePublicConfig,
  SOFTWARE_DISCOVERY_SCHEMA,
} from "@/lib/supabase/config";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabasePublicConfig();

  return createServerClient(url, publishableKey, {
    db: {
      schema: SOFTWARE_DISCOVERY_SCHEMA,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies.
          // A future auth issue can add Next.js proxy-based session refresh if needed.
        }
      },
    },
  });
}
