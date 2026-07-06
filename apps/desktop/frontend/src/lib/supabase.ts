import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { StorageKeys } from "@apps/desktop/lib/storage";
import { Database } from "@packages/supabase";



export const supabase = (host?: string): SupabaseClient<Database> => {
  const $host = window.localStorage.getItem(StorageKeys.ProjDocs.Host.API);
  if (!$host) throw new Error(`localStorage('${StorageKeys.ProjDocs.Host.API}') is unset`);

  const url = new URL(host ?? $host);
  url.pathname = "/public/supabase/proxy";

  return createClient<Database>(url.toString(), "handled-in-proxy", {
    accessToken: async () => window.localStorage.getItem(StorageKeys.ProjDocs.Auth.Session),
    auth: {
      autoRefreshToken: false,
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
};