import { LayoutProps } from "@apps/web/lib/types/layout";
import { createServerClient } from "@apps/web/lib/supabase/server";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/components/card";
import { SelectOrgButton } from "@apps/web/app/organizations/[organization-id]/client-side";
import DashboardLayout from "@packages/ui/layouts/dashboard";
import RouterBridge from "@apps/web/components/router-bridge";



export default async function(
  props: LayoutProps<
    Promise<{
      "organization-id": string;
    }>
  >,
) {
  const params = await props.params;
  const supabase = await createServerClient();

  const { data: organizations, error: orgError } = await supabase
    .from("organizations")
    .select();
  const organization = organizations?.find(
    (org) => org.id === params["organization-id"],
  );

  if (orgError || !organization)
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className={"w-full max-w-sm"}>
          <CardHeader>
            <CardTitle>{"Unable to load organization!"}</CardTitle>
            <CardDescription>
              {"An error occurred while loading the selected organization."}
            </CardDescription>
          </CardHeader>
          <CardFooter className={"flex flex-row justify-center"}>
            <SelectOrgButton />
          </CardFooter>
        </Card>
      </div>
    );

  const user = await supabase.auth.getClaims();
  if (user.error || !user.data?.claims)
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className={"w-full max-w-sm"}>
          <CardHeader>
            <CardTitle>{"Unable to load user!"}</CardTitle>
            <CardDescription>
              {"An error occurred while loading the current user."}
            </CardDescription>
          </CardHeader>
          <CardFooter className={"flex flex-row justify-center"}>
            <SelectOrgButton />
          </CardFooter>
        </Card>
      </div>
    );

  const profile = await supabase
    .from("profiles")
    .select()
    .eq("user_id", user.data.claims.sub)
    .eq("organization_id", params["organization-id"])
    .single();
  if (profile.error)
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className={"w-full max-w-sm"}>
          <CardHeader>
            <CardTitle>{"Unable to load profile!"}</CardTitle>
            <CardDescription>
              {"An error occurred while loading the current user's profile."}
            </CardDescription>
          </CardHeader>
          <CardFooter className={"flex flex-row justify-center"}>
            <SelectOrgButton />
          </CardFooter>
        </Card>
      </div>
    );

  return (
    <RouterBridge>
      <DashboardLayout
        organization={organization}
        organizations={organizations}
        user={{
          data: user.data.claims,
          profile: profile.data,
        }}
      >
        {props.children}
      </DashboardLayout>
    </RouterBridge>
  );
}
