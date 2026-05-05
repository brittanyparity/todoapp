import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local."
  );
}

/**
 * Browser client: uses the anon key and respects Row Level Security.
 * Sessions are persisted (localStorage) by default.
 */
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
