"use client";

import { Button } from "@packages/ui/components/button";
import { useRouter } from "next/navigation";
import { SidebarMenuButton, useSidebar } from "@packages/ui/components/sidebar";
import * as React from "react";
import { useIsMobile } from "@packages/ui/hooks/use-mobile";
import { SidebarUserDropdown, SidebarUserProps } from "../../../components/sidebar-user-dropdown";
import { MenuIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@packages/ui/components/avatar";
import { H1, H3 } from "@packages/ui/components/typography";
import { CreateFolderDialog } from "@apps/web/components/create-folder-dialog";
import { FileViewer } from "@apps/web/components/file-viewer";
import { Tables } from "@packages/supabase";



export const SelectOrgButton = () => {

  const router = useRouter();

  return (<Button onClick={() => router.push("/organizations")}>{"Select Organization"}</Button>);
};

export const MobileSidebarTrigger = (props: {
  user: SidebarUserProps;
}) => {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="relative flex flex-row items-center bg-sidebar p-2 pt-0.5">

      {/* Menu — centered */}
      <div className="mx-auto flex flex-col items-center">
        <div className="w-(--sidebar-width-icon)">
          <SidebarMenuButton onClick={toggleSidebar} size="lg" className="rounded-full">
            <Avatar>
              <AvatarFallback>
                <MenuIcon />
              </AvatarFallback>
            </Avatar>
          </SidebarMenuButton>
        </div>
        <p className="text-muted-foreground text-xs">Menu</p>
      </div>

      {/* User — pinned right */}
      <div className="absolute right-2 flex flex-col items-center">
        <div className="w-(--sidebar-width-icon)">
          <SidebarUserDropdown
            user={props.user}
            button={{ className: "rounded-full" }}
          />
        </div>
        <p className="text-muted-foreground text-xs">User</p>
      </div>

    </div>
  );

};

export const DashboardPageBody = (props: {
  user: Tables<"profiles">;
  member: Tables<"members">;
  organizationID: string;
}) => (
  <div className={"flex w-full flex-col p-16"}>
    <H1>{`Welcome back, ${props.user.first_name}!`}</H1>

    <div className={"flex flex-col gap-4"}>

      <div className={"flex flex-row gap-2 justify-between items-center"}>
        <H3>{"My Files"}</H3>
        <CreateFolderDialog member_id={props.member.id} />
      </div>

      <FileViewer.Member organizationID={props.organizationID} member={props.member} />
    </div>
  </div>
)