import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar";
import { Badge } from "@workspace/ui/components/badge";
import { icons } from "@workspace/ui/components/nav-items";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@workspace/ui/components/collapsible";
import { ChevronRight } from "lucide-react";



type NavSectionStandaloneItem = {
  name: string;
  icon: number;
  url: string;
  isComingSoon?: true;
}

type NavSectionItemGroup = {
  name: string;
  icon: number;
  pathStartsWith: string;
  items: readonly Omit<NavSectionStandaloneItem, "icon">[];
};

export type NavSectionItem = NavSectionStandaloneItem | NavSectionItemGroup;


export type NavSection = {
  title: string | undefined;
  items: readonly NavSectionItem[];
  isAdmin?: true;
}

const Icon = ({ item }: {
  item: NavSectionItem;
}) => {
  const Icon = item.icon ? icons[item.icon] : undefined;
  return Icon === undefined ? undefined : <Icon/>;
};

export function NavSection(props: {
  section: NavSection;
  router: {
    navigate: (url: string) => void;
    path: string;
  }
}) {


  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      {props.section.title !== undefined && (
        <SidebarGroupLabel>{props.section.title}</SidebarGroupLabel>
      )}
      <SidebarMenu>
        {props.section.items.map((item) => (
          "url" in item ? (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                disabled={item.url === props.router.path || item.isComingSoon}
                isActive={item.url === props.router.path}
                onClick={() => props.router.navigate(item.url)}
              >
                <Icon item={item}/>
                <span>{item.name}</span>
                {item.isComingSoon && (
                  <Badge
                    variant="outline"
                  >
                    {"Coming Soon"}
                  </Badge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <Collapsible
              asChild
              key={item.name}
              defaultOpen={props.router.path.startsWith(item.pathStartsWith)}
              className={"group/collapsible"}
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.name}>
                    <Icon item={item}/>
                    <span>{item.name}</span>
                    <ChevronRight
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"/>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.name} className={"w-full"}>
                        <SidebarMenuSubButton
                          className={"w-full"}
                          disabled={subItem.url === props.router.path || subItem.isComingSoon}
                          isActive={subItem.url === props.router.path}
                          onClick={() => props.router.navigate(subItem.url)}
                        >
                          <div>
                            <span>{subItem.name}</span>
                            {subItem.isComingSoon && (
                              <Badge
                                variant="outline"
                              >
                                {"Coming Soon"}
                              </Badge>
                            )}
                          </div>
                        </SidebarMenuSubButton>

                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )

        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
