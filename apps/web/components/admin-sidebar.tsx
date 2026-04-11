import * as React from "react";

import {
  AdminSidebarGroup,
  AdminSidebarGroupProps,
} from "@/components/admin-sidebar-group";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import {
  AudioLinesIcon,
  BookOpenIcon,
  BotIcon,
  FrameIcon,
  GalleryVerticalEndIcon,
  MapIcon,
  PieChartIcon,
  Settings2Icon,
  TerminalIcon,
  TerminalSquareIcon,
} from "lucide-react";
import { Code } from "@workspace/ui/components/typography";
import { createServerClient } from "@/lib/supabase/server";

type AdminSidebarProps = {
  groups: readonly AdminSidebarGroupProps[];
};

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioLinesIcon />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <TerminalIcon />,
      plan: "Free",
    },
  ],
  navMain: [],
  projects: [],
};

const adminSidebar: AdminSidebarProps = {
  groups: [
    {
      title: "Platform",
      items: [
        {
          title: "Playground",
          url: "#",
          icon: <TerminalSquareIcon />,
          isActive: true,
          items: [
            {
              title: "History",
              url: "#",
            },
            {
              title: "Starred",
              url: "#",
            },
            {
              title: "Settings",
              url: "#",
            },
          ],
        },
        {
          title: "Models",
          url: "#",
          icon: <BotIcon />,
          items: [
            {
              title: "Genesis",
              url: "#",
            },
            {
              title: "Explorer",
              url: "#",
            },
            {
              title: "Quantum",
              url: "#",
            },
          ],
        },
        {
          title: "Documentation",
          url: "#",
          icon: <BookOpenIcon />,
          items: [
            {
              title: "Introduction",
              url: "#",
            },
            {
              title: "Get Started",
              url: "#",
            },
            {
              title: "Tutorials",
              url: "#",
            },
            {
              title: "Changelog",
              url: "#",
            },
          ],
        },
        {
          title: "Settings",
          url: "#",
          icon: <Settings2Icon />,
          items: [
            {
              title: "General",
              url: "#",
            },
            {
              title: "Team",
              url: "#",
            },
            {
              title: "Billing",
              url: "#",
            },
            {
              title: "Limits",
              url: "#",
            },
          ],
        },
      ],
    },
    {
      title: "Projects",
      items: [
        {
          title: "Design Engineering",
          url: "#",
          icon: <FrameIcon />,
        },
        {
          title: "Sales & Marketing",
          url: "#",
          icon: <PieChartIcon />,
        },
        {
          title: "Travel",
          url: "#",
          icon: <MapIcon />,
        },
      ],
    },
  ],
};

export async function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {

  const supabase = await createServerClient(process.env.SUPABASE_SECRET_KEY)
  const orgs = await supabase.from("organizations").select();


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher orgs={orgs.data} />
      </SidebarHeader>
      <SidebarContent>
        {adminSidebar.groups.map((group, index) => (
          <AdminSidebarGroup key={`AdminSidebarGroup[${index}]`} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className={"flex w-full flex-row justify-center"}>
          <Code>{process.env.PROJDOCS_VERSION ?? "v0.0.0"}</Code>
        </div>

        {/*<NavUser user={data.user} />*/}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
