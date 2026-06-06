import { Tables } from "@packages/supabase";
import { ReactNode } from "react";



export type FilePreviewProps = {
  file: Tables<"files">;
  version: Tables<"files_versions">;
  organization: Pick<Tables<"organizations">, "id">
  apiURL: string;
}

export type Viewer = ((props: {
  blob: Blob,
}) => ReactNode) & {
  isSupported: (mimeType: string) => boolean;
}