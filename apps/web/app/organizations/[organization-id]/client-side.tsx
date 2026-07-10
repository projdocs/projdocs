"use client";

import { Button } from "@packages/ui/components/button";
import { useRouter } from "next/navigation";
import { SidebarMenuButton, useSidebar } from "@packages/ui/components/sidebar";
import * as React from "react";
import { useIsMobile } from "@packages/ui/hooks/use-mobile";
import { SidebarUserDropdown, SidebarUserProps } from "../../../../../packages/ui/src/layouts/dashboard/sidebar-user-dropdown";
import { MenuIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@packages/ui/components/avatar";
import { H3 } from "@packages/ui/components/typography";
import { CreateFolderDialog } from "@apps/web/components/create-folder-dialog";
import { Tables } from "@packages/supabase";
import { ObjectPage } from "@packages/ui/components/page";



export const SelectOrgButton = () => {

  const router = useRouter();

  return (<Button onClick={() => router.push("/organizations")}>{"Select Organization"}</Button>);
};

export const DashboardPageBody = (props: {
  user: Tables<"profiles">;
  member: Tables<"members">;
  organizationID: string;
}) => (
  <ObjectPage title={`Welcome back, ${props.user.first_name}!`}>
    <div className={"flex flex-col gap-4"}>




    </div>
  </ObjectPage>
);