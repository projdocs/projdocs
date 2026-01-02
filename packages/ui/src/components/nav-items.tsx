import { NavSection } from "@workspace/ui/components/nav-section";
import {
  IconDashboard,
  IconDatabase,
  IconDatabaseStar,
  IconFolderStar,
  IconListDetails,
  IconUsers,
  TablerIcon
} from "@tabler/icons-react";
import { GlobeIcon, LucideIcon, SquareFunctionIcon } from "lucide-react";



export const icons: readonly (LucideIcon | TablerIcon)[] = [
  IconDashboard,
  IconUsers,
  IconListDetails,
  IconDatabase,
  IconDatabaseStar,
  IconFolderStar,
  SquareFunctionIcon,
  GlobeIcon,
];

export const sections: readonly NavSection[] = [
  {
    title: "Landing",
    items: [
      {
        name: "Dashboard",
        icon: 0,
        url: "/dashboard"
      },
      {
        name: "Team",
        url: "/dashboard/team",
        icon: 1,
        isComingSoon: true
      },
      {
        name: "Lifecycle",
        url: "/dashboard/lifecycle",
        icon: 2,
        isComingSoon: true
      }
    ]
  },
  {
    title: "Documents",
    items: [
      {
        name: "Clients",
        url: "/dashboard/clients",
        icon: 3,
      },
      {
        name: "My Clients",
        url: "/dashboard/my-clients",
        icon: 4,
      },
      {
        name: "My Projects",
        url: "/dashboard/my-projects",
        icon: 5,
        isComingSoon: true
      },
    ]
  },
  {
    title: "Admin",
    isAdmin: true,
    items: [
      {
        name: "Organization",
        pathStartsWith: "/dashboard/admin/org",
        icon: 7,
        items: [
          {
            name: "Settings",
            isComingSoon: true,
            url: "/dashboard/admin/org"
          },
          {
            name: "Admins",
            url: "/dashboard/admin/org/admins"
          }
        ],
      },
      {
        name: "Clients",
        pathStartsWith: "/dashboard/admin/clients",
        icon: 3,
        items: [
          {
            name: "Manage",
            isComingSoon: true,
            url: "/dashboard/admin/clients",
          },
          {
            name: "Automations",
            isComingSoon: true,
            url: "/dashboard/admin/clients/automations"
          }
        ]
      }
    ]
  }
];