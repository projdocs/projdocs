"use server";


import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const apiKey = formData.get("apiKey") as string;

  if (!apiKey || apiKey.trim() === "") {
    return { error: "API key is required." };
  }

  const cookieStore = await cookies();
  cookieStore.set("admin-api-key", apiKey.trim(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    // session cookie: omit maxAge/expires so it ends with the browser session
  });

  redirect("/admin/dashboard");
}
