"use server";

import "server-only";
import { createServerClient as createClient } from "@supabase/ssr";
import { Database } from "@packages/supabase";

export async function createServiceRoleClient() {
  return createClient<Database>(
    process.env.SUPABASE_KONG_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
