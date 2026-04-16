import { NextResponse } from "next/server";
import { isAdmin } from "@apps/web/lib/is-admin";

async function forwardToSupabaseAPI(
  request: Request,
  method: string,
  params: { path: string[] }
) {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (!process.env.SUPABASE_KONG_URL) {
    console.error("SUPABASE_KONG_URL is not configured.");
    return NextResponse.json(
      { message: "Server configuration error." },
      { status: 500 }
    );
  }



  const { path } = params;
  const apiPath = path.join("/");

  const url = new URL(process.env.SUPABASE_KONG_URL);
  url.pathname = apiPath;
  const baseParams = new URL(request.url).searchParams
  for (const key of baseParams.keys()) url.searchParams.set(key, baseParams.get(key)!);

  // start as anon
  let key = process.env.SUPABASE_PUBLISHABLE_KEY;

  // elevate to service_role if user is admin
  if (await isAdmin()) {
    const serviceRoleKey = process.env.SUPABASE_SECRET_KEY;
    if (!serviceRoleKey) console.error("SERVICE_ROLE_KEY is not configured.");
    else key = serviceRoleKey;
  }

  try {
    const forwardHeaders: { [key: string]: string } = {
      Authorization: `Bearer ${key}`,
      apikey: key ?? "",
      "x-api-key": key ?? "",
    };

    // Copy relevant headers from the original request
    const contentType = request.headers.get("content-type");
    if (contentType) {
      forwardHeaders["Content-Type"] = contentType;
    }

    const fetchOptions: RequestInit = {
      method,
      headers: forwardHeaders,
      redirect: "manual",
    };

    // Include body for methods that support it
    if (method !== "GET" && method !== "HEAD") {
      try {
        const body = await request.text();
        if (body) {
          fetchOptions.body = body;
        }
      } catch (error) {
        // Handle cases where body is not readable
        console.warn("Could not read request body:", error);
      }
    }

    const response = await fetch(url, fetchOptions);

    // Forward redirects so OAuth flows reach the provider
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        return NextResponse.redirect(location, { status: response.status });
      }
    }


    // Get response body
    const responseText = await response.text();
    let responseData;

    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch {
      responseData = responseText;
    }

    // Return the response with the same status
    return NextResponse.json(responseData, { status: response.status });
  } catch (error: any) {
    console.error("Supabase API proxy error:", error);
    const errorMessage = error.message || "An unexpected error occurred.";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return forwardToSupabaseAPI(request, "GET", resolvedParams);
}

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return forwardToSupabaseAPI(request, "HEAD", resolvedParams);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return forwardToSupabaseAPI(request, "POST", resolvedParams);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return forwardToSupabaseAPI(request, "PUT", resolvedParams);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return forwardToSupabaseAPI(request, "DELETE", resolvedParams);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return forwardToSupabaseAPI(request, "PATCH", resolvedParams);
}
