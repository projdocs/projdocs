import { Database } from "@packages/supabase";
import { SupabaseClient } from "@supabase/supabase-js";



export const getProject = (supabase: SupabaseClient<Database>, props: {
  projectID: string;
  organizationID: string;
}) => supabase
  .from("projects")
  .select("*, client:clients(*)")
  .eq("id", props.projectID)
  .eq("organization_id", props.organizationID)
  .single();