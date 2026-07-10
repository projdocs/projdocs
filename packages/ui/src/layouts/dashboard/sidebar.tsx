import * as React from "react";

import { CustomSidebarGroup, SidebarGroups } from "@packages/ui/layouts/dashboard/custom-sidebar-group";
import { OrganizationSwitcher } from "@packages/ui/layouts/dashboard/organization-switcher";
import {
  Sidebar as $Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@packages/ui/components/sidebar";
import { SidebarUserDropdown } from "@packages/ui/layouts/dashboard/sidebar-user-dropdown";
import type { Tables } from "@packages/supabase";
import type { JwtPayload } from "@supabase/auth-js";
import { useLibraryRouter } from "@packages/ui/routing";



export type CustomSidebarGroups = readonly SidebarGroups[];

export function Sidebar({
                          groups,
                          organization,
                          organizations,
                          user,
                          ...props
                        }: React.ComponentProps<typeof $Sidebar> & {
  groups: CustomSidebarGroups;
  organization: Tables<"organizations">;
  organizations: readonly Tables<"organizations">[];
  user?: {
    account: JwtPayload;
    profile: Pick<Tables<"profiles">, "full_name">;
  };
}) {

  const router = useLibraryRouter();

  return (
    <$Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher
          organizations={organizations}
          onClick={({ id }) => router.navigate(`/organizations/${id}`)}
          organization={organization}
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
                onLogoutClick={() => router.navigate("/auth/logout")}
                user={{
                  name: user.profile.full_name,
                  email: user.account.email ?? user.account.phone ?? user.account.sub,
                  avatar: user.account.user_metadata?.picture ??
                    user.account.user_metadata?.avatar_url,
                }}
              />
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </$Sidebar>
  );
}
