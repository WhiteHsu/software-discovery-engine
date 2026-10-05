import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabasePublicConfig,
  SOFTWARE_DISCOVERY_SCHEMA,
} from "@/lib/supabase/config";

export function createClient() {
  const { url, publishableKey } = getSupabasePublicConfig();

  return createBrowserClient(url, publishableKey, {
    db: {
      schema: SOFTWARE_DISCOVERY_SCHEMA,
    },
  });
}
