import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";



export async function proxy(request: NextRequest) {

  let continueResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.SUPABASE_KONG_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        detectSessionInUrl: false,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          continueResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            continueResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([ key, value ]) =>
            continueResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    if (
      !request.nextUrl.pathname.startsWith("/auth/login") &&
      !request.nextUrl.pathname.startsWith("/supabase/proxy/auth/v1/token")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("next", request.url);
      return NextResponse.redirect(url);
    }
  } else {
    if (request.nextUrl.pathname.startsWith("/auth/login")) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return continueResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
