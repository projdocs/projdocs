"use server";
import { cookies } from "next/headers";

export async function onServer<T extends (...args: any[]) => any>(
  fn: T
): Promise<(...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>> {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    return fn(...args);
  };
}

export const isAdmin = async () => {
  if (process.env.ENABLE_PROJDOCS_ADMIN !== "1") {
    console.error(
      `runtime environment variable ENABLE_PROJDOCS_ADMIN is not configured properly (expected: '1', got: '${process.env.ENABLE_PROJDOCS_ADMIN}'`
    );
    return false;
  }

  const cookieStore = await cookies();
  const adminApiKey = cookieStore.get("admin-api-key")?.value;

  const isNotAdmin =
    !adminApiKey ||
    !process.env.__PROJDOCS_ADMIN_API_KEY ||
    process.env.__PROJDOCS_ADMIN_API_KEY.length !== 40 ||
    adminApiKey !== process.env.__PROJDOCS_ADMIN_API_KEY;

  return !isNotAdmin;
};
