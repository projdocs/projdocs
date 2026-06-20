import { LoginForm } from "@apps/web/app/auth/login/login-form";
import { ErrorPage } from "@packages/ui/components/page";
import { connection } from "next/server";



export default async function() {

  await connection();

  const apiBase = process.env.PROJDOCS_API_URL;
  const kongURL = process.env.SUPABASE_KONG_URL;
  const pubKey = process.env.SUPABASE_PUBLISHABLE_KEY;


  let url: URL;
  try {
    url = new URL(apiBase);
  } catch (e) {
    return <ErrorPage title={"Configuration Error"} description={"`PROJDOCS_API_URL` is not a valid URL"} />;
  }
  url.pathname = "/public/auth/providers";

  let providers;
  try {
    const r = await fetch(url.toString());
    if (!r.ok) {
      const { error }: { error: string } = await r.json();
      return (
        <ErrorPage title={"Unable to List Authentication Providers!"} description={error} />
      );
    }
    const { data }: { data: ReadonlyArray<{ display: string; identifier: string }> } = await r.json();
    providers = data;
  } catch (error) {
    if (error instanceof TypeError && (
      error.message === "fetch failed" ||
      error.message === "Failed to fetch" ||
      error.message === "Load failed"
    ))
      return (
        <ErrorPage
          title={"Network Error!"}
          description={"A connection to the backend api-service could not be established (is it running?)."}
        />
      );
    else {
      console.error("An unexpected error occurred:", error);
      return (
        <ErrorPage
          title={"Unable to List Authentication Providers!"}
          description={"An unexpected error occurred."}
        />
      );
    }
  }


  return (
    <div className={"flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10"}>
      <LoginForm
        providers={providers}
        supabase={{
          url: kongURL,
          publishableKey: pubKey,
        }}
      />
    </div>
  );


}
