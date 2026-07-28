import { Tables } from "@packages/supabase";



export type FileViewable = {
  id: string;
  type: "FILE";
  name: string;
  number: number;
  created_at: string;
  organization_id: string;
  path: string;
  mime_type: string;
  parent: {
    id: string;
  }
};

export type FolderViewable = {
  id: string;
  type: "FOLDER";
  name: string;
  created_at: string;
  organization_id: string;
  path: string;
};

export type Viewable = FileViewable | FolderViewable;

export type FileViewerProps = {
  items: ReadonlyArray<Viewable>;
  organizationID: string;
  onRowClick?: (viewable: Viewable) => void;
  onRowDoubleClick?: (viewable: Viewable) => void;
  apiURL: string;
};

export type Folder = Tables<"folders"> & {
  client: Tables<"clients"> | null;
  project: Tables<"projects"> | null;
  organization: Tables<"organizations"> | null;
  folder: Tables<"folders"> | null;
}