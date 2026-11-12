import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Anonymous (publishable-key) client for public reads and enquiry inserts.
 * RLS applies as the `anon` role. Create per request; never persists a session.
 */
export function createPublicDb() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend is not configured");

  const shimFetch: typeof fetch = (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };

  return createClient<Database>(url, key, {
    global: { fetch: shimFetch },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}
