import { Database, Tables } from "@packages/supabase/types.gen";
import { SupabaseClient } from "@supabase/supabase-js";
import { PaginatedDataTableDataGetter } from "@packages/ui/components/data-table";



export const getSupabaseRows =
  <Table extends keyof Database["public"]["Tables"]>(props: {
    table: Table;
    supabase:
      | (() => SupabaseClient<Database>)
      | (() => Promise<SupabaseClient<Database>>);
  }): PaginatedDataTableDataGetter<Tables<Table>> =>
  async ({ pagination: { from, to }, abortSignal, sort }) => {
    const supabase = await props.supabase();

    let query = supabase.from(props.table).select("*", { count: "exact" });
    if (sort !== null)
      query = query.order(sort.id.split(".").pop()!, {
        ascending: !sort?.desc,
      });
    const { error, data, count } = await query
      .range(from, to)
      .abortSignal(abortSignal);

    if (error || typeof count !== "number") {
      console.error(error ?? "count is null");
      return { count: 0, rows: [] };
    }

    return {
      count: count,
      rows: data as Tables<Table>[],
    };
  };
