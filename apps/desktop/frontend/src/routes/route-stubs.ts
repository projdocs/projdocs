import { DashboardPage, DashboardPageProps } from "@packages/ui/routing/pages/dashboard";
import { ComponentType } from "react";
import { ClientsPage, ClientsPageProps } from "@packages/ui/routing/pages/clients";
import { FavoriteClientsPage, FavoriteClientsPageProps } from "@packages/ui/routing/pages/clients-favorites";
import { supabase } from "@apps/desktop/lib/supabase";
import { LoaderFunction } from "react-router-dom";
import { Shim } from "./handlers/shim";
import { Enums } from "@packages/supabase/types.gen";
import { StorageKeys } from "@apps/desktop/lib/storage";



type Route<T extends Record<string, any>> = {
  Component: ComponentType<T>;
  loader: LoaderFunction;
}

type RouteStubs = {
  Dashboard: Route<DashboardPageProps>;
  Clients: Route<ClientsPageProps>;
  FavoriteClients: Route<FavoriteClientsPageProps>;
}

export default {
  Dashboard: {
    Component: Shim(DashboardPage),
    loader: async function(props): Promise<DashboardPageProps> {

      const organizationID = props.params.organizationID;
      if (!organizationID) throw new Error("No organization ID param");

      const { data: { session }, error } = await supabase().auth.getSession();
      if (error || !session) throw new Error("Unable to Load Session!");

      const user = await supabase().from("profiles").select().eq("user_id", session.user.id).eq("organization_id", organizationID).single();
      if (user.error) throw new Error("Unable to Load Profile!");

      const member = await supabase().from("members").select("*, permission:permissions!inner(*)").eq("user_id", user.data.user_id).eq("permissions.organization_id", organizationID).single();
      if (member.error) throw new Error("Unable to Load User!");

      return {
        user: user.data,
        member: member.data,
        organizationID: organizationID,
      };
    },
  },
  Clients: {
    Component: Shim(ClientsPage),
    loader: async function(props): Promise<ClientsPageProps> {
      const organizationID = props.params.organizationID;
      if (!organizationID) throw new Error("No organization ID param");

      const api = window.localStorage.getItem(StorageKeys.ProjDocs.Host.API);
      if (!api) throw new Error("No API set!");

      const { data: permissions, error } = await supabase().from("members").select("*, permissions:permissions_id!inner(*)").eq("permissions.organization_id", organizationID!).single();
      if (error) throw new Error("Unable to Load Permissions!");

      return {
        organizationID,
        canCreate: ([ "EDIT", "DELETE" ] as Enums<"permission_levels">[]).includes(permissions.permissions.clients ?? "NONE"),
        projdocsApiUrl: api,
      }
    },
  },
  FavoriteClients: {
    Component: Shim(FavoriteClientsPage),
    loader: async function(props): Promise<FavoriteClientsPageProps> {

      const organizationID = props.params.organizationID;
      if (!organizationID) throw new Error("No organization ID param");

      return {
        organizationID
      }
    },
  },
} satisfies RouteStubs;

