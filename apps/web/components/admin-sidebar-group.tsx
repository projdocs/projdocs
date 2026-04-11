"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar";
import { ChevronRightIcon } from "lucide-react";
import { ReactNode } from "react";

export type AdminSidebarMenuSubitem = Pick<
  AdminSidebarMenuItem,
  "title" | "url" | "isActive"
>;

export type AdminSidebarMenuItem = {
  title: string;
  url: string;
  isActive?: boolean;
  icon: ReactNode;
  items?: readonly AdminSidebarMenuSubitem[];
};

export type AdminSidebarGroupProps = {
  title: string;
  items: readonly AdminSidebarMenuItem[];
};



export function AdminSidebarGroup(props: AdminSidebarGroupProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{props.title}</SidebarGroupLabel>
      <SidebarMenu>
        {props.items.map((item, index) => (
          <Collapsible
            key={`${index}-${item.url}`}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              { item.items === undefined ? (
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              ) : (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon}
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) }
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
