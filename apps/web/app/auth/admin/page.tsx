import LoginForm from "@apps/web/app/auth/admin/login-form";
import { cookies } from "next/headers";

export default function () {
  return (
    <LoginForm
      isDev={
        process.env.__PROJDOCS_ADMIN_API_KEY ===
        "pak-00000000-0000-0000-0000-000000000000"
      }
      loginAction={async (formData: FormData) => {
        "use server";
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

        return {};
      }}
    />
  );
}
