import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";
import { authCookieOptions } from "@/lib/supabase/cookie-options";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copy .env.local.example to .env.local and fill in your Supabase credentials."
    );
  }

  return createBrowserClient<Database>(url, key, {
    cookieOptions: authCookieOptions,
  });
}
