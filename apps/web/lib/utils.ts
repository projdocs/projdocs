import { Database, Tables } from "@packages/supabase/types.gen";
import { SupabaseClient } from "@supabase/supabase-js";
import { PaginatedDataTableDataGetter } from "@packages/ui/components/data-table";



export const getSupabaseRows =
  <
    Table extends keyof Database["public"]["Tables"],
    Omitted extends readonly (keyof Tables<Table>)[],
  >(props: {
    table: Table;
    omitColumns?: Omitted;
    supabase:
      | (() => Promise<SupabaseClient<Database>>)
      | (() => SupabaseClient<Database>);
  }): PaginatedDataTableDataGetter<Omit<Tables<Table>, Omitted[number]>> =>
  async ({ pagination: { from, to }, sort }) => {
    const supabase = await props.supabase();

    let query = supabase.from(props.table).select("*", { count: "exact" });
    if (sort !== null)
      query = query.order(sort.id.split(".").pop()!, {
        ascending: !sort?.desc,
      });
    const { error, data, count } = await query.range(from, to);

    if (error || typeof count !== "number") {
      console.error(error ?? "count is null");
      return { count: 0, rows: [] };
    }

    return {
      count: count,
      rows: (data as Tables<Table>[]).map(row => {
        for (const key of props.omitColumns ?? []) {
          delete row[key];
        }
        return row as Omit<Tables<Table>, Omitted[number]>;
      }),
    };
  };
