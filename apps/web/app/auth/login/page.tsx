import { LoginForm } from "@apps/web/app/auth/login/login-form";
import { Card, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { ErrorPage } from "@packages/ui/components/page";



export default async function() {


  const apiBase = process.env.PROJDOCS_API_URL;
  if (!apiBase) {
    return <ErrorPage title={"Configuration Error"} description={"`PROJDOCS_API_URL` is not set"} />;
  }

  const kongURL = process.env.SUPABASE_KONG_URL?.trim();
  if (!kongURL) {
    return <ErrorPage title={"Configuration Error"} description={"`SUPABASE_KONG_URL` is not set"} />;
  }

  const pubKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!pubKey) {
    return <ErrorPage title={"Configuration Error"} description={"`SUPABASE_PUBLISHABLE_KEY` is not set"} />;
  }

  let url: URL;
  try {
    url = new URL(apiBase);
  } catch (e) {
    return <ErrorPage title={"Configuration Error"} description={"`PROJDOCS_API_URL` is not a valid URL"} />;
  }
  url.pathname = "/public/auth/providers";

  const r = await fetch(url.toString());

  if (!r.ok) {
    const { error }: { error: string } = await r.json();
    return (
      <ErrorPage title={"Unable to List Authentication Providers!"} description={error} />
    );
  }

  const { data: providers }: { data: ReadonlyArray<{ display: string; identifier: string }> } = await r.json();

  if (providers.length === 0) return (
    <Card className={"w-full max-w-sm"}>
      <CardHeader>
        <CardTitle>{"No Provider Connected!"}</CardTitle>
        <CardDescription>{"No authentication provider has been configured for this ProjDocs instance."}</CardDescription>
      </CardHeader>
    </Card>
  );

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
