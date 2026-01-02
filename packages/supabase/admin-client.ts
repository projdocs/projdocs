import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@workspace/supabase/types.gen";
import process from "node:process";



export function createServiceRoleClient(): SupabaseClient<Database> {

  const url = process.env.SUPABASE_PUBLIC_URL;
  const serviceKey = process.env.SUPABASE_PRIVATE_KEY;

  if (!url) throw new Error("Missing SUPABASE_PUBLIC_URL");
  if (!serviceKey) throw new Error("Missing SUPABASE_PRIVATE_KEY");

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}