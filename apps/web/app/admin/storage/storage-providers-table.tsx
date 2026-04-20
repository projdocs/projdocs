"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  PaginatedDataTable,
  PaginatedDataTableDataGetter,
} from "@packages/ui/components/data-table";
import { Tables } from "@packages/supabase/types.gen";

type Column = Tables<"storage_providers">;

const column = createColumnHelper<Column>();
const columns = [
  column.accessor("type", {
    header: "Type",
  }),
  column.accessor("id", {
    header: "ID",
  }),
] as ColumnDef<Column>[];

export default function StorageProvidersTable(props: {
  getRowsAction: PaginatedDataTableDataGetter<Column>;
}) {
  return (
    <PaginatedDataTable<Column>
      columns={columns}
      getData={props.getRowsAction}
    />
  );
}
