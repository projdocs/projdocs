"use client";

import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@packages/ui/components/sidebar";
import {
  AlertCircleIcon,
  Building,
  BuildingIcon,
  ChevronsUpDownIcon,
  PlusIcon,
} from "lucide-react";
import { Tables } from "@packages/supabase/types.gen";
import { redirect } from "next/navigation";
import Favicon from "@packages/ui/branding/favicon/no-bg";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@packages/ui/components/alert";

export function OrganizationSwitcher({
  orgs,
  current,
}: {
  current:
    | {
        isAdmin: false;
        org: Tables<"organizations">;
      }
    | {
        isAdmin: true;
        org: null;
      };
  orgs: null | readonly Tables<"organizations">[];
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary text-sidebar-primary-foreground">
                {current.isAdmin ? <Favicon /> : <BuildingIcon />}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{"ProjDocs"}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {current.isAdmin ? "Admin Portal" : current.org.display}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-100 rounded-lg"
            align="start"
            side={"right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {orgs === null ? (
              <Alert variant="destructive" className="max-w-md">
                <AlertCircleIcon />
                <AlertTitle>{"Failed to Load"}</AlertTitle>
                <AlertDescription>
                  {"An error occurred while loading organizations!"}
                </AlertDescription>
              </Alert>
            ) : (
              orgs.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => redirect(`/organizations/${org.id}`)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Building />
                  </div>
                  {org.display}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={orgs === null} className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusIcon className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Add organization
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
