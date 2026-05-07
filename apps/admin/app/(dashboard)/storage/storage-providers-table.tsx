"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import {
  PaginatedDataTable,
  PaginatedDataTableDataGetter,
} from "@packages/ui/components/data-table";
import { Tables } from "@packages/supabase/types.gen";
import { Checkbox } from "@packages/ui/components/checkbox";
import { Button } from "@packages/ui/components/button";
import { testConnection } from "./test-connection";
import { toast } from "sonner";
import { StorageProviderTypes } from "@packages/shared/utilities/storage/type";

type Column = Omit<Tables<"storage_providers">, "data">;

const column = createColumnHelper<Column>();
const columns = [
  column.accessor("type", {
    header: "Type",
    cell: (info) => StorageProviderTypes[info.getValue()],
  }),
  column.accessor("is_valid", {
    header: "Valid Configuration",
    cell: (info) => (
      <div className={"flex w-full flex-row items-center gap-2"}>
        <Checkbox checked={info.getValue()} disabled />
        <Button
          size={"xs"}
          variant={"outline"}
          onClick={() =>
            toast.promise(testConnection(info.row.original.id), {
              loading: "Loading...",
              success: "Connection successful!",
              error: (err) => ({
                message: "An error occurred!",
                description: `${err}`
              }),
            })
          }
        >
          {"Test Connection"}
        </Button>
      </div>
    ),
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
