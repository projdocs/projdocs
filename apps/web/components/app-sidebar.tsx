import * as React from "react";
import { IconInnerShadowTop, } from "@tabler/icons-react";

import { NavSection } from "@workspace/ui/components/nav-section";
import { NavQuickCreate } from "@workspace/ui/components/nav-quick-create";
import { NavUser } from "@workspace/web/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { sections } from "@workspace/ui/components/nav-items";



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5"/>
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavQuickCreate/>
        {sections.map((section, index) => (
          <NavSection section={section} key={index}/>
        ))}
        {/*<NavSecondary items={data.navSecondary} className="mt-auto"/>*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
    </Sidebar>
  );
}
