import { createServerClient } from "@/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { redirect } from "next/navigation";
import { H1 } from "@workspace/ui/components/typography";

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
  // else if (orgs.data.length === 1)
  //   return redirect(`/organizations/${orgs.data.at(0)!.id}`);
  else
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <H1>{"Select an organization"}</H1>
        {orgs.data.map(org => (
          <Card key={org.id} className={"w-full max-w-sm"}>
            <CardHeader>
              <CardTitle>{org.display}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
}
