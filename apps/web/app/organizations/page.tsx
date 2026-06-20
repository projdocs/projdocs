import { createServerClient } from "@apps/web/lib/supabase/server";
import { Card, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { redirect } from "next/navigation";
import { connection } from "next/server";



export default async function() {

  await connection();

  const supabase = await createServerClient();

  const user = await supabase.auth.getSession();

  const orgs = await supabase.from("organizations").select();

  if (!orgs.error && orgs.data.length === 0 && user.data.session?.user.role === "admin") {
    return redirect("/setup");
  }

  if (orgs.error)
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className={"w-full max-w-sm"}>
          <CardHeader>
            <CardTitle>{"Unable to Load Organizations!"}</CardTitle>
            <CardDescription>
              {`An unexpected error occurred while loading organizations: ${orgs.error.message}!`}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  else if (orgs.data.length === 0)
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className={"w-full max-w-sm"}>
          <CardHeader>
            <CardTitle>{"No Organizations!"}</CardTitle>
            <CardDescription>
              {
                "You do not have access to any organizations (or none have been configured yet)."
              }
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  else return redirect(`/organizations/${orgs.data.at(0)!.id}`);
}
