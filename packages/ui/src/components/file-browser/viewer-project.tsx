import { FileViewerProps } from "./types";
import { Tables } from "@packages/supabase";
import { ObjectFileBrowserPrimitive } from "./primitive-object";



export const ProjectFileBrowser = ({ project, ...props }: Omit<FileViewerProps, "items" | "organizationID"> & {
  project: Tables<"projects">
}) => (
  <ObjectFileBrowserPrimitive
    {...props}
    organizationID={project.organization_id}
    table={"projects"}
    object={project}
    column={"project_id"}
  />
);