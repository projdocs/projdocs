"use client";

import { Filters, getSupabaseRows } from "@packages/supabase/lib/utils";
import { PaginatedDataTable } from "@packages/ui/components/data-table";
import { Tables } from "@packages/supabase";
import { ClientColumns, CLIENTS_TABLE_REFRESH_EVENT } from "@packages/ui/components/clients-table/cols";
import { useLibraryRouter } from "@packages/ui/routing";
import { useLibrarySupabase } from "@packages/ui/lib/supabase-adapter";



export const ClientsTable = (props: {
  organizationID: string;
  filters?: Filters<"clients">;
  select?: string;
}) => {
  const router = useLibraryRouter();
  const supabase = useLibrarySupabase();

  return (
    <PaginatedDataTable
      className={"pb-8"}
      refreshEvent={CLIENTS_TABLE_REFRESH_EVENT}
      columns={ClientColumns}
      onRowClick={(row) => router.navigate(`/organizations/${props.organizationID}/clients/${row.id}`)}
      getData={async r => {
        const res = await getSupabaseRows({
          supabase: () => supabase,
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