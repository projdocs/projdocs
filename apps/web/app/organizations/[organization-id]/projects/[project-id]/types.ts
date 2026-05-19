import { Database, Tables } from "@packages/supabase";



export type SearchResult = Database["public"]["Functions"]["search_table"]["Returns"][number];
export type Project = Tables<"projects"> & {
  links: ReadonlyArray<Tables<"clients_projects"> & {
    client: Tables<"clients">;
  }>
}