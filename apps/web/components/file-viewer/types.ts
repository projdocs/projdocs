import { Tables } from "@packages/supabase";



export type FileView = {
  id: string;
  type: "FILE";
  name: string;
  number: number;
  version: number;
  created_at: string;
  organization_id: string;
};

export type FolderView = {
  id: string;
  type: "FOLDER";
  name: string;
  created_at: string;
  organization_id: string;
};

export type Viewable = FileView | FolderView;

export type FileViewerProps = {
  items: ReadonlyArray<Viewable>;
  organizationID: string;
};

export type Folder = Tables<"folders"> & {
  client: Tables<"clients"> | null;
  project: Tables<"projects"> | null;
  organization: Tables<"organizations"> | null;
  member: Tables<"members"> | null;
  folder: Tables<"folders"> | null;
}