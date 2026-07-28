import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { StorageKeys } from "@apps/desktop/lib/storage";
import { Database } from "@packages/supabase";



const store: {
  [key: string]: SupabaseClient<Database>
} = {};

export const supabase = (_host?: string): SupabaseClient<Database> => {

  let host: string | null = _host ?? null;
  if (!host) {
    host = window.localStorage.getItem(StorageKeys.ProjDocs.Host.API);
    if (!host) throw new Error(`localStorage('${StorageKeys.ProjDocs.Host.API}') is unset`);
  }

  const url = new URL(host);
  url.pathname = "/public/supabase/proxy";

  const storageKey = url.host;
  if (storageKey in store) return store[storageKey]!;

  store[storageKey] = createClient<Database>(url.toString(), "handled-in-proxy", {
    auth: {
      storageKey,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storage: {
        getItem(key) {
          return window.localStorage.getItem(key);
        },
        setItem(key, value) {
          return window.localStorage.setItem(key, value);
        },
        removeItem(key) {
          return window.localStorage.removeItem(key);
        },
      },
    },
  });

  return store[storageKey]!;
};