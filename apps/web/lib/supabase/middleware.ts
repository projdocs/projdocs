import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@workspace/supabase/types";



export async function updateSession(request: NextRequest) {

  const redirect = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    return NextResponse.redirect(url);
  };

  const response = NextResponse.next({ request });

  // @ts-expect-error
  const supabase: SupabaseClient = createServerClient(
    process.env.SUPABASE_PUBLIC_URL,
    process.env.SUPABASE_PUBLIC_KEY,
    {
      auth: { storageKey: "train360-dms" },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // 🚨 Do not insert logic between createClient and getClaims
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Redirect unauthenticated users to /auth/login
  if (
    !user &&
    request.nextUrl.pathname !== "/" &&
    !request.nextUrl.pathname.startsWith("/auth/login")
  ) return redirect("/auth/login");
  else if (!!user) {
    const mfa = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (mfa.data) {
      // SEE: https://supabase.com/docs/guides/auth/auth-mfa/totp#add-a-challenge-step-to-login
      if (!request.nextUrl.pathname.startsWith("/auth/mfa/enroll") && mfa.data.currentLevel === "aal1" && mfa.data.nextLevel === "aal1") return redirect("/auth/mfa/enroll");
      if (!request.nextUrl.pathname.startsWith("/auth/mfa/verify") && mfa.data.currentLevel === "aal1" && mfa.data.nextLevel === "aal2") return redirect("/auth/mfa/verify");
    }
  }

  // handle setup stuff
  if (user && request.nextUrl.pathname === "/setup") {
    const company = await supabase.from("company").select().single();
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    if (company.data && company.data.is_setup) return NextResponse.redirect(url);
  }

  return response;
}