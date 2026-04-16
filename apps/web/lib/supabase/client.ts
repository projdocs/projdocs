import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@workspace/supabase/types.gen";

export function supabase() {
  const url = new URL(window.origin);
  url.pathname = "/api/v1/supabase/proxy";

  return createBrowserClient<Database>(url.toString(), "not-set", {
    auth: {
      detectSessionInUrl: false
    }
  });
}
