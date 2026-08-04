import { Database } from "@packages/supabase/types.gen";
import { SupabaseClient } from "@supabase/supabase-js";



export const getDashboardFiles = async (supabase: SupabaseClient<Database>, profileID: string, limit: number = 50) => await supabase
  .from("files")
  .select("*, versions:files_versions!inner(*)")
  .order("modified_at", { ascending: false })
  .eq("versions.last_modified_by", profileID)
  .limit(limit);