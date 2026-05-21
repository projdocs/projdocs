import { NextResponse } from "next/server";

async function forwardToSupabaseAPI(
  request: Request,
  method: string,
  params: { path: string[] }
) {
  if (!process.env.SUPABASE_KONG_URL) {
    return NextResponse.json(
      { message: "Server configuration error." },
      { status: 500 }
    );
  }

  const apiPath = params.path.join("/");

  const url = new URL(process.env.SUPABASE_KONG_URL);
  url.pathname = `${url.pathname.replace(/\/$/, "")}/${apiPath}`;

  const baseParams = new URL(request.url).searchParams;
  baseParams.forEach((value, key) => {
    url.searchParams.set(
      key,
      key === "apikey" ? process.env.SUPABASE_PUBLISHABLE_KEY! : value
    );
  });

  try {
    const headers = new Headers(request.headers);
    headers.set("apikey", process.env.SUPABASE_PUBLISHABLE_KEY!);
    if (!headers.has("Authorization")) {
      headers.set(
        "Authorization",
        `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY!}`
      );
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      redirect: "manual",
    };

    if (method !== "GET" && method !== "HEAD") {
      const body = await request.text();
      if (body) fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (location) {
        return NextResponse.redirect(location, { status: response.status });
      }
    }

    const res = new NextResponse(response.body, {
      status: response.status,
    });

    response.headers.forEach((value, key) => {
      res.headers.set(key, value);
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return forwardToSupabaseAPI(request, "GET", await params);
}

export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return forwardToSupabaseAPI(request, "HEAD", await params);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return forwardToSupabaseAPI(request, "POST", await params);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return forwardToSupabaseAPI(request, "PUT", await params);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return forwardToSupabaseAPI(request, "DELETE", await params);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return forwardToSupabaseAPI(request, "PATCH", await params);
}
