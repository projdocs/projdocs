import { LayoutProps } from "@apps/web/lib/types/layout";
import {
  CustomSidebar,
  CustomSidebarGroups,
} from "@apps/web/components/custom-sidebar";
import { SidebarInset, SidebarProvider } from "@packages/ui/components/sidebar";
import {
  BuildingIcon,
  DatabaseZapIcon, FingerprintIcon,
  LayoutDashboardIcon,
  UserLock,
  UsersIcon,
} from "lucide-react";
import * as React from "react";
import { createServiceRoleClient } from "@apps/web/lib/supabase/server";

const adminSidebar: CustomSidebarGroups = [
  {
    items: [
      {
        title: "Dashboard",
        url: `/admin/dashboard`,
        icon: <LayoutDashboardIcon />,
      },
    ],
  },
  {
    title: "Platform",
    items: [
      {
        title: "Authentication",
        url: "",
        icon: <UserLock />,
        items: [
          {
            title: "Users",
            url: "/admin/auth/users",
            icon: <UsersIcon />,
          },
          {
            title: "Identity Providers",
            url: "/admin/auth/providers",
            icon: <FingerprintIcon />
          },
        ],
      },
      {
        title: "Storage",
        url: "/admin/storage",
        icon: <DatabaseZapIcon />,
      },
    ],
  },
];

export default async function ({ children }: LayoutProps) {
  const supabase = await createServiceRoleClient();

  let orgs: CustomSidebarGroups = [];

  const organizations = await supabase.from("organizations").select();
  if (organizations.data)
    orgs = [
      {
        title: "Organizations",
        items: organizations.data.map((org) => ({
          title: org.display,
          url: `/admin/organizations/${org.id}`,
          icon: <BuildingIcon />,
          items: [
            {
              title: "Storage",
              url: `/admin/organizations/${org.id}/storage`,
              icon: <DatabaseZapIcon />,
            },
            {
              title: "Members",
              url: `/admin/organizations/${org.id}/members`,
              icon: <UsersIcon />,
            },
          ],
        })),
      },
    ];

  return (
    <SidebarProvider>
      <CustomSidebar
        groups={[...adminSidebar, ...orgs]}
        organizations={organizations.data ?? []}
      />
      <SidebarInset>
        <div className={"flex h-full w-full flex-col"}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
