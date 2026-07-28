import "server-only";
import { createServerClient as createClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@packages/supabase/types.gen";



export async function createServerClient() {
  const cookieStore = await cookies();

  const url = new URL(process.env.PROJDOCS_API_URL);
  url.pathname = "/public/supabase/proxy"

  return createClient<Database>(
    url.toString(),
    "set-in-proxy",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
