"use client";
import { ReactNode } from "react";
import { Tables } from "@packages/supabase";
import { FolderHeartIcon, FolderIcon, LayoutDashboardIcon, MenuIcon, UserIcon, UserStarIcon } from "lucide-react";
import { CustomSidebarGroups, Sidebar } from "@packages/ui/layouts/dashboard/sidebar";
import { SidebarInset, SidebarMenuButton, SidebarProvider, useSidebar } from "@packages/ui/components/sidebar";
import { SidebarGroups } from "@packages/ui/layouts/dashboard/custom-sidebar-group";
import { JwtPayload } from "@supabase/auth-js";
import { useLibraryRouter } from "@packages/ui/routing";
import { SidebarUserDropdown, SidebarUserProps } from "@packages/ui/layouts/dashboard/sidebar-user-dropdown";
import { useIsMobile } from "@packages/ui/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@packages/ui/components/avatar";



const MobileSidebarTrigger = (props: {
  user: SidebarUserProps;
}) => {

  const router = useLibraryRouter();
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
            onLogoutClick={() => router.navigate("/auth/logout")}
          />
        </div>
        <p className="text-muted-foreground text-xs">User</p>
      </div>

    </div>
  );

};

const getItems = (props: Pick<SidebarGroups, "onClick" | "path"> & {
  organization: Tables<"organizations">;
}) =>
  [
    {
      ...props,
      items: [
        {
          title: "Dashboard",
          url: `/organizations/${props.organization.id}`,
          icon: <LayoutDashboardIcon />,
        },
      ],
    },
    {
      title: "Clients",
      ...props,
      items: [
        {
          title: "My Clients",
          url: `/organizations/${props.organization.id}/clients-favorites`,
          icon: <UserStarIcon />,
        },
        {
          title: "All Clients",
          url: `/organizations/${props.organization.id}/clients`,
          icon: <UserIcon />,
        },
      ],
    },
    {
      title: "Projects",
      ...props,
      items: [
        {
          title: "My Projects",
          url: `/organizations/${props.organization.id}/projects-favorites`,
          icon: <FolderHeartIcon />,
        },
        {
          title: "All Projects",
          url: `/organizations/${props.organization.id}/projects`,
          icon: <FolderIcon />,
        },
      ],
    },
  ] satisfies CustomSidebarGroups;

export type DashboardLayoutProps = {
  user: {
    profile: Tables<"profiles">;
    data: JwtPayload;
  };
  organization: Tables<"organizations">;
  organizations: readonly Tables<"organizations">[];
  children: ReactNode;
  topOffset?: string;
}

export default function DashboardLayout(props: DashboardLayoutProps) {

  const { usePathname, navigate } = useLibraryRouter();
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar
        className={props.topOffset}
        organizations={props.organizations}
        organization={props.organization}
        user={{
          account: props.user.data,
          profile: props.user.profile,
        }}
        groups={getItems({
          organization: props.organization,
          onClick: (route) => navigate(route),
          path: pathname,
        })}
      />
      <SidebarInset>
        <div className="flex h-dvh w-full flex-col">
          <div className="flex-1 overflow-y-auto">
            {props.children}
          </div>
          <MobileSidebarTrigger
            user={{
              name: props.user.profile.full_name,
              email: props.user.data.email ?? props.user.data.phone ?? props.user.data.sub,
              avatar: props.user.data.user_metadata?.picture ??
                props.user.data.user_metadata?.avatar_url,
            }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}