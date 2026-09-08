import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config.server.js";
function getPublicClient() {
  const { url, publishableKey: key } = getSupabaseConfig();
  return createClient(url, key, {
    auth: { storage: void 0, persistSession: false, autoRefreshToken: false },
    global: {
      // Opaque sb_ keys are not JWTs; send them only as the apikey header.
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      }
    }
  });
}
export {
  getPublicClient
};
