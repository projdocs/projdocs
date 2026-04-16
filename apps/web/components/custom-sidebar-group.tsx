"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@packages/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@packages/ui/components/sidebar";
import { ChevronRightIcon } from "lucide-react";
import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@packages/ui/components/button";

export type AdminSidebarMenuSubitem = Pick<
  AdminSidebarMenuItem,
  "title" | "url"
>;

export type AdminSidebarMenuItem = {
  title: string;
  url: string;
  icon: ReactNode;
  items?: readonly AdminSidebarMenuSubitem[];
};

export type SidebarGroups = {
  title?: string;
  items: readonly AdminSidebarMenuItem[];
};

export function CustomSidebarGroup(props: SidebarGroups) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {typeof props.title === "string" && (
        <SidebarGroupLabel>{props.title}</SidebarGroupLabel>
      )}
      <SidebarMenu>
        {props.items.map((item, index) => (
          <Collapsible
            key={`${index}-${item.url}`}
            asChild
            defaultOpen={item.url === pathname || ( item.items !== undefined && !!item.items.find(item => item.url === pathname) )}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              {item.items === undefined ? (
                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() => router.push(item.url)}
                  disabled={item.url === pathname}
                  className={"disabled:bg-secondary"}
                >
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
                      {item.items?.map((item) => (
                        <SidebarMenuSubItem key={item.title}>
                          <Button
                            size={"sm"}
                            variant={"ghost"}
                            onClick={() => router.push(item.url)}
                            disabled={item.url === pathname}
                            className={
                              "w-full justify-start disabled:bg-secondary"
                            }
                          >
                            <span>{item.title}</span>
                          </Button>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
