import {
  CustomSidebar,
  CustomSidebarGroups,
} from "@apps/admin/components/sidebar/custom-sidebar";
import { SidebarInset, SidebarProvider } from "@packages/ui/components/sidebar";
import {
  BuildingIcon,
  DatabaseZapIcon, FingerprintIcon,
  LayoutDashboardIcon,
  UserLock,
  UsersIcon,
} from "lucide-react";
import * as React from "react";
import { createServiceRoleClient } from "@apps/admin/lib/supabase";
import { ReactNode } from "react";

const adminSidebar: CustomSidebarGroups = [
  {
    items: [
      {
        title: "Dashboard",
        url: `/`,
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
            url: "/auth/users",
            icon: <UsersIcon />,
          },
          {
            title: "Identity Providers",
            url: "/auth/providers",
            icon: <FingerprintIcon />
          },
        ],
      },
      {
        title: "Storage",
        url: "/storage",
        icon: <DatabaseZapIcon />,
      },
    ],
  },
];

export default async function ({ children }: {
  children: ReactNode;
}) {
  const supabase = await createServiceRoleClient();

  let orgs: CustomSidebarGroups = [];

  const organizations = await supabase.from("organizations").select();
  if (organizations.data)
    orgs = [
      {
        title: "Organizations",
        items: organizations.data.map((org) => ({
          title: org.display,
          url: `/organizations/${org.id}`,
          icon: <BuildingIcon />,
          items: [
            {
              title: "Storage",
              url: `/organizations/${org.id}/storage`,
              icon: <DatabaseZapIcon />,
            },
            {
              title: "Members",
              url: `/organizations/${org.id}/members`,
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
