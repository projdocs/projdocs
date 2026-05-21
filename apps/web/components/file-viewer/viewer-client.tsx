import { FileViewerProps } from "@apps/web/components/file-viewer/types";
import { Tables } from "@packages/supabase";
import { ObjectFileViewerPrimitive } from "@apps/web/components/file-viewer/primitive-object";



export const ClientFileViewer = ({ client, ...props }: Omit<FileViewerProps, "items" | "organizationID"> & {
  client: Tables<"clients">
}) => (
  <ObjectFileViewerPrimitive
    {...props}
    organizationID={client.organization_id}
    table={"clients"}
    object={client}
    column={"client_id"}
  />
);