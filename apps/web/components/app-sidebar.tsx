import { NavSection } from "@workspace/ui/components/nav-section";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { sections } from "@workspace/ui/components/nav-items";
import { ComponentProps } from "react";
import { Tables } from "@workspace/supabase/types.gen";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { BuildingIcon } from "lucide-react";
import { NavUser } from "@workspace/web/components/nav-user";



type AppSidebarProps = ComponentProps<typeof Sidebar> & {
  router: {
    path: string;
    navigate: (url: string) => void;
  }
  auth?: {
    company: Tables<"company"> | null | undefined;
    user: Tables<"users"> | null | undefined;
    isAdmin: boolean | undefined;
  }
}


export function AppSidebar({ router, auth, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible={"offcanvas"} {...props}>
      {!!auth?.company && (
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className={"w-full max-w-full pl-1.5 flex flex-row gap-2 items-center justify-center"}>
                <Avatar className={"w-[25px] h-[25px]"}>
                  <AvatarImage className={"bg-muted"} src={auth.company.logo_url ?? undefined} alt={"logo"}/>
                  <AvatarFallback>
                    <BuildingIcon/>
                  </AvatarFallback>
                </Avatar>
                <p className="text-base font-semibold truncate">{auth.company.name}</p>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
      )}
      <SidebarContent>
        {/*<NavQuickCreate/>*/}
        {sections.filter(section => section.isAdmin ? auth?.isAdmin : true).map((section, index) => (
          <NavSection
            router={router}
            section={section}
            key={index}
          />
        ))}
      </SidebarContent>
      <SidebarFooter>
        { !!auth?.user && (
          <NavUser user={auth.user} navigate={router.navigate} />
        ) }
      </SidebarFooter>
    </Sidebar>
  );
}
