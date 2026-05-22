import "server-only";
import { createServerClient as createClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@packages/supabase/types.gen";



export async function createServerClient() {
  const cookieStore = await cookies();

  return createClient<Database>(
    process.env.SUPABASE_KONG_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
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
