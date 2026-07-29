import { DashboardPage, DashboardPageProps } from "@packages/ui/routing/pages/dashboard";
import { ComponentType } from "react";
import { ClientsPage, ClientsPageProps } from "@packages/ui/routing/pages/clients";
import { FavoriteClientsPage, FavoriteClientsPageProps } from "@packages/ui/routing/pages/clients-favorites";
import { supabase } from "@apps/desktop/lib/supabase";
import { LoaderFunction } from "react-router-dom";
import { Shim } from "./handlers/shim";
import { Enums } from "@packages/supabase/types.gen";
import { StorageKeys } from "@apps/desktop/lib/storage";
import { ProjectsPage, ProjectsPageProps } from "@packages/ui/routing/pages/projects";
import { FavoriteProjectsPage, FavoriteProjectsPageProps } from "@packages/ui/routing/pages/projects-favorites";
import { ClientPage, ClientPageProps } from "@packages/ui/routing/pages/client";
import { ProjectPage, ProjectPageProps } from "@packages/ui/routing/pages/project";
import { getProject } from "@packages/ui/routing/pages/project-utils";



type Route<T extends Record<string, any>> = {
  Component: ComponentType<T>;
  loader: LoaderFunction;
}

type RouteStubs = {
  Dashboard: Route<DashboardPageProps>;

  Client: Route<ClientPageProps>;
  Clients: Route<ClientsPageProps>;
  FavoriteClients: Route<FavoriteClientsPageProps>;

  Project: Route<ProjectPageProps>;
  Projects: Route<ProjectsPageProps>;
  FavoriteProjects: Route<FavoriteProjectsPageProps>;
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
  Project: {
    Component: Shim(ProjectPage),
    loader: async function(props): Promise<ProjectPageProps> {

      const apiURL = window.localStorage.getItem(StorageKeys.ProjDocs.Host.API);
      if (!apiURL) throw new Error("No API set!");

      const organizationID = props.params.organizationID;
      if (!organizationID) throw new Error("No organization ID param");

      const projectID = props.params.projectID;
      if (!projectID) throw new Error("No project ID param");

      const project = await getProject(supabase(), { projectID, organizationID });
      if (project.error) throw new Error("Unable to load Project!");

      return {
        apiURL,
        project: project.data,
      };
    },
  },
  Projects: {
    Component: Shim(ProjectsPage),
    loader: async function(props): Promise<ProjectsPageProps> {

      const organizationID = props.params.organizationID;
      if (!organizationID) throw new Error("No organization ID param");

      const apiURL = window.localStorage.getItem(StorageKeys.ProjDocs.Host.API);
      if (!apiURL) throw new Error("No API set!");

      const {
        data: permissions,
        error,
      } = await supabase().from("members").select("*, permissions:permissions_id!inner(*)").eq("permissions.organization_id", organizationID!).single();
      if (error) throw new Error("Unable to Load Permissions!");

      return {
        organizationID,
        apiURL,
        canCreate: ([ "EDIT", "DELETE" ] as Enums<"permission_levels">[]).includes(permissions.permissions.projects ?? "NONE"),
      };
    },
  },
  FavoriteProjects: {
    Component: Shim(FavoriteProjectsPage),
    loader: async function(props): Promise<FavoriteProjectsPageProps> {

      const organizationID = props.params.organizationID;
      if (!organizationID) throw new Error("No organization ID param");

      return {
        organizationID,
      };
    },
  },
  Client: {
    Component: Shim(ClientPage),
    loader: async function(props): Promise<ClientPageProps> {

      const apiURL = window.localStorage.getItem(StorageKeys.ProjDocs.Host.API);
      if (!apiURL) throw new Error("No API set!");

      const organizationID = props.params.organizationID;
      if (!organizationID) throw new Error("No organization ID param");

      const clientID = props.params.clientID;
      if (!clientID) throw new Error("No client ID param");

      const client = await supabase().from("clients").select().eq("id", clientID).eq("organization_id", organizationID).single();
      if (client.error) throw new Error("Unable to load Client!");

      return {
        apiURL,
        client: client.data,
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

      const {
        data: permissions,
        error,
      } = await supabase().from("members").select("*, permissions:permissions_id!inner(*)").eq("permissions.organization_id", organizationID!).single();
      if (error) throw new Error("Unable to Load Permissions!");

      return {
        organizationID,
        canCreate: ([ "EDIT", "DELETE" ] as Enums<"permission_levels">[]).includes(permissions.permissions.clients ?? "NONE"),
        projdocsApiUrl: api,
      };
    },
  },
  FavoriteClients: {
    Component: Shim(FavoriteClientsPage),
    loader: async function(props): Promise<FavoriteClientsPageProps> {

      const organizationID = props.params.organizationID;
      if (!organizationID) throw new Error("No organization ID param");

      return {
        organizationID,
      };
    },
  },
} satisfies RouteStubs;

