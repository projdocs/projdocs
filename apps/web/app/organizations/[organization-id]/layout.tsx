import { LayoutProps } from "@apps/web/lib/types/layout";
import { SidebarInset, SidebarProvider } from "@packages/ui/components/sidebar";
import {
  CustomSidebar,
  CustomSidebarGroups,
} from "@apps/web/components/custom-sidebar";
import { createServerClient } from "@apps/web/lib/supabase/server";
import { LayoutDashboardIcon } from "lucide-react";
import { Tables } from "@packages/supabase/types.gen";
import {
  Card,
  CardDescription, CardFooter,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card";
import { Button } from "@packages/ui/components/button";
import { SelectOrgButton } from "@apps/web/app/organizations/[organization-id]/_components/select-org-button";

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
  ] satisfies CustomSidebarGroups;

export default async function (
  props: LayoutProps<
    Promise<{
      "organization-id": string;
    }>
  >
) {
  const params = await props.params;
  const supabase = await createServerClient();

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select()
    .eq("id", params["organization-id"])
    .single();

  if (orgError)
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className={"w-full max-w-sm"}>
          <CardHeader>
            <CardTitle>{"Unable to load organization!"}</CardTitle>
            <CardDescription>
              {
                "An error occurred while loading the selected organization."
              }
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
      <CustomSidebar
        organization={organization}
        groups={getItems({
          organization,
        })}
      />
      <SidebarInset>
        <div className="flex h-dvh w-full flex-col overflow-scroll">
          {props.children}

          {/*<div className="grid auto-rows-min gap-4 md:grid-cols-3">*/}
          {/*  <div className="aspect-video rounded-xl bg-muted/50" />*/}
          {/*  <div className="aspect-video rounded-xl bg-muted/50" />*/}
          {/*  <div className="aspect-video rounded-xl bg-muted/50" />*/}
          {/*</div>*/}
          {/*<div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />*/}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
