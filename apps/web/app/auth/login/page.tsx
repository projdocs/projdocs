import { LoginForm } from "@apps/web/app/auth/login/login-form";
import { ErrorPage } from "@packages/ui/components/page";
import { connection } from "next/server";
import { createServerClient } from "@apps/web/lib/supabase/server";
import { redirect } from "next/navigation";



export default async function() {

  await connection();

  const supabase = await createServerClient();
  const isLoggedIn = await supabase.auth.getSession().then(({ data }) => !!data.session?.user.id).catch(() =>false)
  if(isLoggedIn) return redirect("/organizations")

  let url: URL;
  try {
    url = new URL(process.env.PROJDOCS_API_URL);
    url.pathname = "/public/auth/providers";
  } catch (e) {
    return <ErrorPage title={"Configuration Error"} description={"`PROJDOCS_API_URL` is not a valid URL"} />;
  }


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
    <div className={"h-full w-full flex flex-col items-center justify-center"}>
      <LoginForm providers={providers} />
    </div>
  );

}
