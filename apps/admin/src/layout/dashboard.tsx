import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import * as React from "react";
import { CSSProperties, ReactNode } from "react";
import AdminSidebarMenu from "@workspace/admin/layout/client-side";
import { H3, H4 } from "@workspace/ui/components/text.tsx";
import * as process from "node:process";
import { Badge } from "@workspace/ui/components/badge.tsx";



export default function DashboardLayout({ children }: {
  children: ReactNode;
}) {


  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as CSSProperties
      }
    >
      <Sidebar variant="floating" className={"bg-background p-4 pr-0"}>
        <SidebarHeader>
          <div className={"p-2"}>
            <H3>{"ProjDocs"}</H3>
            <div className={"flex flex-row items-center gap-2"}>
              <H4>{"Server"}</H4>
              <Badge>v{process.env.VERSION ?? "0.0.0"}</Badge>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <AdminSidebarMenu/>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className={"w-full h-full p-4"}>
          <div className="flex flex-1 flex-col gap-4 h-full rounded-lg border bg-sidebar overflow-hidden">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
