import { FileViewerProps } from "./types";
import { Tables } from "@packages/supabase";
import { ObjectFileBrowserPrimitive } from "./primitive-object";



export const ClientFileBrowser = ({ client, ...props }: Omit<FileViewerProps, "items" | "organizationID"> & {
  client: Tables<"clients">
}) => (
  <ObjectFileBrowserPrimitive
    {...props}
    organizationID={client.organization_id}
    table={"clients"}
    object={client}
    column={"client_id"}
  />
);