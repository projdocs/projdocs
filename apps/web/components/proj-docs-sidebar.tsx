import * as React from "react";

import { CustomSidebarGroup, SidebarGroups } from "@apps/web/components/custom-sidebar-group";
import { OrganizationSwitcher } from "@apps/web/components/organization-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader, SidebarMenu, SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@packages/ui/components/sidebar";
import { SidebarUserDropdown } from "./sidebar-user-dropdown";
import { Tables } from "@packages/supabase/types.gen";
import { JwtPayload } from "@supabase/auth-js";



export type CustomSidebarGroups = readonly SidebarGroups[];

export async function ProjDocsSidebar({
                                        groups,
                                        organization,
                                        organizations,
                                        user,
                                        ...props
                                      }: React.ComponentProps<typeof Sidebar> & {
  groups: CustomSidebarGroups;
  organization?: Tables<"organizations">;
  organizations: readonly Tables<"organizations">[];
  user?: {
    account: JwtPayload;
    profile: Pick<Tables<"profiles">, "full_name">;
  };
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher
          current={
            organization
              ? { isAdmin: false, org: organization }
              : { isAdmin: true, org: null }
          }
          orgs={organizations}
        />
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group, index) => (
          <CustomSidebarGroup key={`AdminSidebarGroup[${index}]`} {...group} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarTrigger />
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarUserDropdown
                user={{
                  name: user.profile.full_name,
                  email: user.account.email ?? user.account.phone ?? user.account.sub,
                  avatar: user.account.user_metadata?.picture ??
                    user.account.user_metadata?.avatar_url
                }}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
