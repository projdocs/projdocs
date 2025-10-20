"use client";
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@workspace/supabase/types";



export function createClient() {

  console.log(process.env)

  const url = process.env.SUPABASE_PUBLIC_URL;
  const anonKey = process.env.SUPABASE_PUBLIC_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase environment variables not found in window.env");
  }

  return createBrowserClient<Database>(url, anonKey, { auth: { storageKey: "train360-dms" } });
}
