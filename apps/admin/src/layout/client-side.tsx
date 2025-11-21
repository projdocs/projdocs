"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@workspace/ui/components/sidebar";
import * as React from "react";
import { usePathname } from "next/navigation";



type NavItemBase = {
  title: string;
}

type NavItemLink = NavItemBase & {
  url: string;
}

type NavGroup = NavItemBase & {
  items: readonly NavItemLink[];
}

type NavItem = NavItemLink | NavGroup;

const nav: readonly NavItem[] = [
  {
    title: "Services",
    url: "/dashboard",
  },
  {
    title: "Settings",
    items: [
      {
        title: "Authentication",
        url: "/dashboard/authentication",
      },
    ]
  },
];

export default function AdminSidebarMenu() {

  const path = usePathname();

  return (
    nav.map((group, groupNumber) => (
      ("items" in group)
        ? (
          <SidebarGroup key={groupNumber}>
            <SidebarGroupLabel>
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                <SidebarMenuItem key={`navGroup-${groupNumber}`}>
                  {group.items.length ? (
                    <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                      {group.items.map((item, key) => (
                        <SidebarMenuSubItem key={`navGroup-${groupNumber}-item-${key}`}>
                          <SidebarMenuSubButton
                            isActive={path === item.url}
                            asChild
                          >
                            <a href={item.url}>{item.title}</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )
        : (
          <SidebarGroup key={groupNumber}>
            <SidebarMenuItem>
              <SidebarMenuButton
                disabled={group.url === path}
                isActive={group.url === path}
                asChild
              >
                <a href={group.url} className="font-medium">
                  {group.title}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarGroup>
        )
    ))
  );
}