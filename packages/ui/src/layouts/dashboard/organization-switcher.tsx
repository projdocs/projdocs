"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  sidebarMenuButtonVariants,
  SidebarMenuItem,
} from "@packages/ui/components/sidebar";
import { Building, BuildingIcon, ChevronsUpDownIcon, EyeIcon } from "lucide-react";
import { Tables } from "@packages/supabase";
import { cn } from "@packages/ui/lib/utils";



type OrganizationSwitcherProps = {
  organization: Tables<"organizations">;
  organizations: readonly Tables<"organizations">[];
  onClick: (organization: Tables<"organizations">) => unknown;
}

const OrganizationButton = (props: OrganizationSwitcherProps & {
  disabled?: boolean;
}) => (
  <>
    <div
      className="flex aspect-square size-8 items-center justify-center rounded-lg bg-secondary text-sidebar-primary-foreground">
      <BuildingIcon />
    </div>
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-medium">{"ProjDocs"}</span>
      <span className="truncate text-xs text-muted-foreground">{props.organization.display}</span>
    </div>
    {!props.disabled && (
      <ChevronsUpDownIcon className="ml-auto" />
    )}
  </>
);

export function OrganizationSwitcher(props: OrganizationSwitcherProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {props.organizations.length === 1 ? (
          <div className={cn(sidebarMenuButtonVariants({
            variant: "default",
            size: "lg",
          }), "hover:bg-transparent hover:text-inherit")}>
            <OrganizationButton disabled {...props} />
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <OrganizationButton {...props} />
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
              {props.organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => props.onClick(org)}
                  className="gap-2 p-2"
                  disabled={props.organization.id === org.id}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Building />
                  </div>
                  <span className={"flex flex-1"}>{org.display}</span>
                  {props.organization.id === org.id && <EyeIcon />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
