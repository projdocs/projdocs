import { LayoutProps } from "@apps/web/lib/types/layout";
import {
  CustomSidebar,
  CustomSidebarGroups,
} from "@apps/web/components/custom-sidebar";
import { SidebarInset, SidebarProvider } from "@packages/ui/components/sidebar";
import { redirect } from "next/navigation";
import { isAdmin } from "@apps/web/lib/is-admin";
import { DatabaseZapIcon, LayoutDashboardIcon, UserLock } from "lucide-react";
import * as React from "react";

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
            title: "Providers",
            url: "/admin/dashboard/auth/providers",
          },
        ],
      },
      {
        title: "Storage",
        url: "/admin/dashboard/storage",
        icon: <DatabaseZapIcon />,
        items: [
          {
            title: "Settings",
            url: "/admin/dashboard/storage/settings",
          },
          {
            title: "Browser",
            url: "/admin/dashboard/storage/browser",
          },
        ],
      },
    ],
  },
];

export default async function ({ children }: LayoutProps) {
  if (!(await isAdmin())) return redirect("/admin/auth");

  return (
    <SidebarProvider>
      <CustomSidebar groups={adminSidebar} />
      <SidebarInset>
        <div className={"flex h-full w-full flex-col"}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
