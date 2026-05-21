import { FileViewerProps } from "@apps/web/components/file-viewer/types";
import { Tables } from "@packages/supabase";
import { ObjectFileViewerPrimitive } from "@apps/web/components/file-viewer/primitive-object";



export const ProjectFileViewer = ({ project, ...props }: Omit<FileViewerProps, "items" | "organizationID"> & {
  project: Tables<"projects">
}) => (
  <ObjectFileViewerPrimitive
    {...props}
    organizationID={project.organization_id}
    table={"projects"}
    object={project}
    column={"project_id"}
  />
);