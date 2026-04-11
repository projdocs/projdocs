import { cookies } from "next/headers";
import { redirect } from "next/navigation";



export default async function() {
  const cookieStore = await cookies();
  const adminApiKey = cookieStore.get("admin-api-key")?.value;

  if (
    !adminApiKey ||
    !process.env.__PROJDOCS_ADMIN_API_KEY ||
    process.env.__PROJDOCS_ADMIN_API_KEY.length !== 32 ||
    adminApiKey !== process.env.__PROJDOCS_ADMIN_API_KEY
  ) {
    return redirect("/admin/auth");
  }

  return redirect("/admin/dashboard");
}