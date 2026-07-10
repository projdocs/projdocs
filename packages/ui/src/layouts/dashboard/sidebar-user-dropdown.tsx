"use client";

import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@packages/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import { SidebarMenuButton, SidebarMenuButtonProps, useSidebar } from "@packages/ui/components/sidebar";
import { cn } from "@packages/ui/lib/utils";



export type SidebarUserProps = {
  name: string;
  email: string;
  avatar: string;
}

export type SidebarUserDropdownProps = {
  user: SidebarUserProps;
  button?: SidebarMenuButtonProps;
  onLogoutClick: () => unknown;
};

export function SidebarUserDropdown(props: SidebarUserDropdownProps) {
  const { isMobile } = useSidebar();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          {...props.button}
          className={cn("data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground", props.button?.className)}
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={props.user.avatar} alt={props.user.name} />
            <AvatarFallback className="rounded-lg">{props.user.name[0] ?? "?"}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{props.user.name}</span>
            <span className="truncate text-xs">{props.user.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={props.user.avatar} alt={props.user.name} />
              <AvatarFallback className="rounded-lg">
                {props.user.name[0] ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{props.user.name}</span>
              <span className="truncate text-xs">{props.user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={props.onLogoutClick}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
