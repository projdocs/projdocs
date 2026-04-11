import { LayoutProps } from "@/lib/types/layout";
import { AdminSidebar } from "@/components/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/is-admin";

export default async function ({ children }: LayoutProps) {
  if (!(await isAdmin())) return redirect("/admin/auth");

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <div className={"flex h-full w-full flex-col"}>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
