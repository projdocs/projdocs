"use server";

import { cookies } from "next/headers";

export const isAdmin = async () => {
  const cookieStore = await cookies();
  const adminApiKey = cookieStore.get("admin-api-key")?.value;

  const isNotAdmin =
    !adminApiKey ||
    !process.env.__PROJDOCS_ADMIN_API_KEY ||
    process.env.__PROJDOCS_ADMIN_API_KEY.length !== 40 ||
    adminApiKey !== process.env.__PROJDOCS_ADMIN_API_KEY;

  return !isNotAdmin;
};
