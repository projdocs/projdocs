"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { User } from "@supabase/auth-js";
import {
  PaginatedDataTable,
  PaginatedDataTableDataGetter,
} from "@packages/ui/components/data-table";

type Column = User;

const column = createColumnHelper<Column>();
const columns = [
  column.accessor("email", {
    header: "Email",
  }),
  column.accessor("last_sign_in_at", {
    header: "Last Signed In",
  }),
  column.accessor("created_at", {
    header: "Created At",
  }),
  column.accessor("id", {
    header: "ID",
  }),
] as ColumnDef<Column>[];

export default function UsersTable(props: {
  getRowsAction: PaginatedDataTableDataGetter<Column>;
}) {
  return (
    <PaginatedDataTable<Column>
      columns={columns}
      getData={props.getRowsAction}
    />
  );
}
