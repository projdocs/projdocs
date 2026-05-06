import { Database, Tables } from "@packages/supabase/types.gen";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  PaginatedDataTableDataGetter,
  PaginatedDataTableState,
} from "@packages/ui/components/data-table";

type Result<
  Table extends keyof Database["public"]["Tables"],
  Omitted extends undefined | readonly (keyof Tables<Table>)[],
> = Omitted extends [] ? Omit<Tables<Table>, Omitted[number]> : Tables<Table>;

type Filter<Table extends keyof Database["public"]["Tables"], Column extends keyof Tables<Table>> = {
  column: Column;
  operator: `${"" | "not."}${"eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "is" | "isdistinct" | "in" | "cs" | "cd" | "sl" | "sr" | "nxl" | "nxr" | "adj" | "ov" | "fts" | "plfts" | "phfts" | "wfts" | "match" | "imatch"}`;
  value: Tables<Table>[Column]
};

export const getSupabaseRows =
  <
    Table extends keyof Database["public"]["Tables"],
    Omitted extends undefined | readonly (keyof Tables<Table>)[],
  >(props: {
    table: Table;
    omitColumns?: Omitted;
    filters?: readonly Filter<Table, keyof Tables<Table>>[];
    select?: string;
    supabase:
      | (() => Promise<SupabaseClient<Database>>)
      | (() => SupabaseClient<Database>);
  }): PaginatedDataTableDataGetter<Result<Table, Omitted>> =>
  async ({ pagination: { from, to }, sort }) => {
    const supabase = await props.supabase();

    let query = supabase.from(props.table).select(props.select ?? "*", { count: "exact" });
    if (sort !== null)
      query = query.order(sort.id.split(".").pop()!, {
        ascending: !sort?.desc,
      });

    if(props.filters) for (const filter of props.filters) {
      // @ts-expect-error type casting
      query = query.filter(filter.column, filter.operator, filter.value)
    }

    const { error, data, count } = await query.range(from, to);

    if (error || typeof count !== "number") {
      console.error(error ?? "count is null");
      return { count: 0, rows: [] } satisfies PaginatedDataTableState<
        Result<Table, Omitted>
      >;
    }

    return {
      count: count,
      rows: (data as Tables<Table>[]).map((row) => {
        for (const key of props.omitColumns ?? []) {
          delete row[key];
        }
        return row as PaginatedDataTableState<
          Result<Table, Omitted>
        >["rows"][number];
      }),
    } satisfies PaginatedDataTableState<Result<Table, Omitted>>;
  };
