"use client";

import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@workspace/ui/components/badge";
import { SidebarMenuButton } from "@workspace/ui/components/sidebar";
import { NavSectionItem } from "@workspace/ui/components/nav-section";



export function NavSectionButton({ item }: {
  item: NavSectionItem;
}) {

  const router = useRouter();
  const path = usePathname();

  return (
    <SidebarMenuButton disabled={item.url === path || item.isComingSoon} isActive={item.url === path}
                       onClick={() => router.push(item.url)}>
      <item.icon/>
      <span>{item.name}</span>
      {item.isComingSoon && (
        <Badge
          variant="outline"
        >
          {"Coming Soon"}
        </Badge>
      )}
    </SidebarMenuButton>
  );
}