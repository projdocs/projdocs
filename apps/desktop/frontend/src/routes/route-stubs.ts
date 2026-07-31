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
import { FilePage, FilePageProps } from "@packages/ui/routing/pages/file";
import { FolderPage, FolderPageProps, getFolder } from "@packages/ui/routing/pages/folder";



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

  Files: Route<FilePageProps>;

  Folders: Route<FolderPageProps>
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
  Files: {
    Component: Shim(FilePage),
    loader: async function(props): Promise<FilePageProps> {

      const versionID = props.url.searchParams.get("version-id");

      const apiURL = window.localStorage.getItem(StorageKeys.ProjDocs.Host.API);
      if (!apiURL) throw new Error("No API set!");

      const organizationID = props.params.organizationID;
      if (!organizationID) throw new Error("No organization ID param");

      const fileID = props.params.fileID;
      if (!fileID) throw new Error("No file ID param");

      const { data: file, error } = await supabase()
        .from("files")
        .select()
        .eq("id", fileID)
        .single();
      if (error) throw new Error("Unable to load file!");

      const { data: versions, error: versionsError } = await supabase()
        .from("files_versions")
        .select()
        .eq("files_id", fileID)
        .order("number", { ascending: false });
      if (versionsError) throw new Error("Unable to load file-version!");

      const viewingVersion = versionID === undefined ? versions[0] : versions.find(v => v.id === versionID);
      if (viewingVersion === undefined) throw new Error("Unable to load file version!");

      return {
        apiURL,
        organizationID,
        file,
        versions,
        version: viewingVersion,
        can: {
          edit: (
            await supabase().rpc("check_folder_permissions", {
              folder_id: file.folder_id,
              access_level: "EDIT",
            }).then(({ data, error }) => {
              if (error) console.error(error);
              return data ?? false;
            })
          ),
          delete: (
            await supabase().rpc("check_folder_permissions", {
              folder_id: file.folder_id,
              access_level: "DELETE",
            }).then(({ data, error }) => {
              if (error) console.error(error);
              return data ?? false;
            })
          ),
        },
      };
    },
  },
  Folders: {
    Component: Shim(FolderPage),
    loader: async function(props): Promise<FolderPageProps> {

      const apiURL = window.localStorage.getItem(StorageKeys.ProjDocs.Host.API);
      if (!apiURL) throw new Error("No API set!");

      const organizationID = props.params.organizationID;
      if (!organizationID) throw new Error("No organization ID param");

      const folderID = props.params.folderID;
      if (!folderID) throw new Error("No folder ID param");

      const { data: folder, error } = await getFolder(supabase(), { folderID });
      if (error) throw new Error("Unable to load folder!");

      return {
        apiURL,
        organizationID,
        folder,
      };
    },
  },
} satisfies RouteStubs;

