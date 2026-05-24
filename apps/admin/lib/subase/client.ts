import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@packages/supabase/types.gen";

export function supabase() {
  const url = new URL(window.origin);
  url.pathname = "/supabase/proxy";

  return createBrowserClient<Database>(url.toString(), "not-set", {
    auth: {
      detectSessionInUrl: false
    }
  });
}
