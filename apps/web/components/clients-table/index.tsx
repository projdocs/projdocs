"use client";

import { Filters, getSupabaseRows } from "@packages/supabase/lib/utils";
import { useRouter } from "next/navigation";
import { PaginatedDataTable } from "@packages/ui/components/data-table";
import { supabase } from "@apps/web/lib/supabase/client";
import { Tables } from "@packages/supabase/types.gen";
import { ClientColumns, CLIENTS_TABLE_REFRESH_EVENT } from "@apps/web/components/clients-table/cols";



export const ClientsTable = (props: {
  organizationID: string;
  filters?: Filters<"clients">;
  select?: string;
}) => {
  const router = useRouter();
  return (
    <PaginatedDataTable
      className={"pb-8"}
      refreshEvent={CLIENTS_TABLE_REFRESH_EVENT}
      columns={ClientColumns}
      onRowClick={(row) =>
        router.push(
          `/organizations/${props.organizationID}/clients/${row.id}`,
        )
      }
      getData={async r => {
        const res = await getSupabaseRows({
          supabase,
          table: "clients",
          select: props.select ?? "*, favorites(*), links:clients_projects(*, project:projects(*))",
          filters: [
            {
              column: "organization_id",
              operator: "eq",
              value: props.organizationID,
            },
            ...(props.filters ?? []),
          ],
        })(r);
        return ({
          count: res.count,
          rows: res.rows.map(r => {
            const row = (r as Tables<"clients"> & {
              favorites: Tables<"favorites">[]; links: readonly (Tables<"clients_projects"> & {
                project: Tables<"projects">
              })[];
            });
            return {
              ...row,
              favorite_id: row.favorites?.at(0)?.id ?? null,
            };
          }),
        });
      }}
    />
  );
};

ClientsTable.RefreshEvent = CLIENTS_TABLE_REFRESH_EVENT;