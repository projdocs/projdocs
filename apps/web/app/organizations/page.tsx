import { createServerClient } from "@apps/web/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card";
import { H2 } from "@packages/ui/components/typography";
import { OrgCard } from "@apps/web/app/organizations/org-card";
import { redirect } from "next/navigation";

export default async function () {
  const supabase = await createServerClient();

  const orgs = await supabase.from("organizations").select();

  if (orgs.error)
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className={"w-full max-w-sm"}>
          <CardHeader>
            <CardTitle>{"Unexpected error!"}</CardTitle>
            <CardDescription>
              {"An unexpected error occurred while loading organizations!"}
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
  else if (orgs.data.length === 1)
    return redirect(`/organizations/${orgs.data.at(0)!.id}`);
  else
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-4">
        <H2 className={"text-muted-foreground"}>{"Select an Organization"}</H2>
        {orgs.data.map((org) => (
          <OrgCard organization={org} key={org.id} />
        ))}
      </div>
    );
}
