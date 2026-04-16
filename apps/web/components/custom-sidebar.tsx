import * as React from "react";

import {
  CustomSidebarGroup,
  SidebarGroups,
} from "@apps/web/components/custom-sidebar-group";
import { OrganizationSwitcher } from "@apps/web/components/organization-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@packages/ui/components/sidebar";
import { createServiceRoleClient } from "@apps/web/lib/supabase/server";
import { NavUser } from "@apps/web/components/nav-user";
import { Tables } from "@packages/supabase/types.gen";

export type CustomSidebarGroups = readonly SidebarGroups[];

export async function CustomSidebar({
  groups,
  organization,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  groups: CustomSidebarGroups;
  organization?: Tables<"organizations">;
}) {

  const supabase = await createServiceRoleClient();
  const orgs = await supabase.from("organizations").select();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher
          current={organization ? { isAdmin: false, org: organization } : { isAdmin: true, org: null }}
          orgs={orgs.data}
        />
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group, index) => (
          <CustomSidebarGroup key={`AdminSidebarGroup[${index}]`} {...group} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarTrigger />
        <NavUser
          user={{ name: "Foo Bar", email: "foo@bar.com", avatar: null }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
