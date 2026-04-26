"use client";

import { ObjectPage } from "@apps/web/components/page";
import { PaginatedDataTable } from "@packages/ui/components/data-table";
import { Tables } from "@packages/supabase/types.gen";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { getSupabaseRows } from "@apps/web/lib/utils";
import { supabase } from "@apps/web/lib/supabase/client";
import { use } from "react";

type Column = Tables<"clients">;
const column = createColumnHelper<Column>();
const columns = [
  column.accessor("id", { header: "ID" }),
] as ColumnDef<Column>[];

export default function (props: {
  params: Promise<{
    "organization-id": string;
  }>
}) {

  const params = use(props.params);

  return (
    <ObjectPage title={"Clients"}>
      <PaginatedDataTable
        columns={columns}
        getData={getSupabaseRows({
          supabase,
          table: "clients",
          // filters: [
          //   {
          //     column: "organization_id",
          //     operator: "eq",
          //     value: params["organization-id"]
          //   }
          // ]
        })}
      />
    </ObjectPage>
  );
}
