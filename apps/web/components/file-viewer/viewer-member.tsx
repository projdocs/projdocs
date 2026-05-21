import { FileViewerProps } from "@apps/web/components/file-viewer/types";
import { Tables } from "@packages/supabase";
import { ObjectFileViewerPrimitive } from "@apps/web/components/file-viewer/primitive-object";



export const MemberFileViewer = ({ member, ...props }: Omit<FileViewerProps, "items"> & {
  member: Tables<"members">
}) => (
  <ObjectFileViewerPrimitive
    {...props}
    table={"members"}
    column={"member_id"}
    object={member}
  />
);