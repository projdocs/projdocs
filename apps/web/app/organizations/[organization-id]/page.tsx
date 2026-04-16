import { CustomSidebar } from "@apps/web/components/custom-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@packages/ui/components/breadcrumb"
import { Separator } from "@packages/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@packages/ui/components/sidebar"
import { createServerClient } from "@apps/web/lib/supabase/server";

export default async function Page(props: {
  params: Promise< {
    "organization-id": string
  }>
}) {

  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
      <div className="h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
        <div className="aspect-video rounded-xl bg-muted/50" />
      </div>
    </>
  )
}
