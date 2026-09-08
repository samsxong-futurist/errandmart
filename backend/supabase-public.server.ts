import { createClient } from "@supabase/supabase-js";
import type { Database } from "./integration/supabase/types";
import { getSupabaseConfig } from "./config.server";

/** Anon-key client for public, read-only catalogue queries on the server. */
export function getPublicClient() {
  const { url, publishableKey: key } = getSupabaseConfig();
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      // Opaque sb_ keys are not JWTs; send them only as the apikey header.
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}
