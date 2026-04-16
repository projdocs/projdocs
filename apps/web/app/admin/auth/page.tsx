import LoginForm from "@apps/web/app/admin/auth/_components/login-form";

export default function () {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <LoginForm
        isDev={
          process.env.__PROJDOCS_ADMIN_API_KEY ===
          "pak-00000000-0000-0000-0000-000000000000"
        }
      />
    </div>
  );
}
