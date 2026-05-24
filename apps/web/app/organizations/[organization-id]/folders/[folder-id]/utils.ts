import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@packages/supabase";



export const getFolder = (supabase: SupabaseClient<Database>, props: {
  folderID: string;
}) => supabase
  .from("folders")
  .select("*, client:clients(*), project:projects(*), organization:organizations(*), folder:folder_id(*)").eq("id", props.folderID)
  .single();