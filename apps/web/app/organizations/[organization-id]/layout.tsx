import { LayoutProps } from "@apps/web/lib/types/layout";
import { SidebarInset, SidebarProvider } from "@packages/ui/components/sidebar";
import { CustomSidebarGroups, ProjDocsSidebar } from "../../../components/proj-docs-sidebar";
import { createServerClient } from "@apps/web/lib/supabase/server";
import { FolderHeartIcon, FolderIcon, LayoutDashboardIcon, UserIcon, UserStarIcon } from "lucide-react";
import { Tables } from "@packages/supabase/types.gen";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@packages/ui/components/card";
import { MobileSidebarTrigger, SelectOrgButton } from "@apps/web/app/organizations/[organization-id]/client-side";



const getItems = (props: { organization: Tables<"organizations"> }) =>
  [
    {
      items: [
        {
          title: "Dashboard",
          url: `/organizations/${props.organization.id}`,
          icon: <LayoutDashboardIcon />,
        },
      ],
    },
    {
      title: "Clients",
      items: [
        {
          title: "My Clients",
          url: `/organizations/${props.organization.id}/clients-favorites`,
          icon: <UserStarIcon />,
        },
        {
          title: "All Clients",
          url: `/organizations/${props.organization.id}/clients`,
          icon: <UserIcon />,
        },
      ],
    },
    {
      title: "Projects",
      items: [
        {
          title: "My Projects",
          url: `/organizations/${props.organization.id}/projects/favorites`,
          icon: <FolderHeartIcon />,
        },
        {
          title: "All Projects",
          url: `/organizations/${props.organization.id}/projects`,
          icon: <FolderIcon />,
        },
      ],
    },
  ] satisfies CustomSidebarGroups;

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
    <SidebarProvider>
      <ProjDocsSidebar
        organizations={organizations}
        organization={organization}
        groups={getItems({
          organization,
        })}
        user={{
          profile: profile.data,
          account: user.data.claims,
        }}
      />
      <SidebarInset>
        <div className="flex h-dvh w-full flex-col">
          <div className="flex-1 overflow-y-auto">
            {props.children}
          </div>
          <MobileSidebarTrigger
            user={{
              name: profile.data.full_name,
              email: user.data.claims.email ?? user.data.claims.phone ?? user.data.claims.sub,
              avatar: user.data.claims.user_metadata?.picture ??
                user.data.claims.user_metadata?.avatar_url,
            }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
