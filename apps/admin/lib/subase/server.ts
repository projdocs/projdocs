import "server-only";
import { createServerClient as createClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@packages/supabase";



export async function createServerClient() {

  const KongUrl = process.env.SUPABASE_KONG_URL;
  if (!KongUrl) throw new Error("Server configuration error: `SUPABASE_KONG_URL` is not set.");

  const PublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!PublishableKey) throw new Error("Server configuration error: `SUPABASE_PUBLISHABLE_KEY` is not set.");

  const cookieStore = await cookies();

  return createClient<Database>(
    KongUrl,
    PublishableKey,
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
