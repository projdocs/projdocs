"use client";

import { PaginatedDataTable } from "@packages/ui/components/data-table";
import { getSupabaseRows } from "@packages/supabase/lib/utils";
import { supabase } from "@apps/web/lib/supabase/client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ObjectPage } from "@packages/ui/components/page";
import {
  ClientColumns,
  CLIENTS_TABLE_REFRESH_EVENT,
} from "@apps/web/app/organizations/[organization-id]/clients/cols";
import { Tables } from "@packages/supabase";



export default function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {
  const params = use(props.params);
  const router = useRouter();

  //   const members = await supabase
  //     .from("members")
  //     .select("*, permissions!inner(*)")
  //     .eq("permissions.organization_id", org.data.id);

  return (
    <ObjectPage title={"Clients"}>
      <PaginatedDataTable
        className={"pb-8"}
        refreshEvent={CLIENTS_TABLE_REFRESH_EVENT}
        columns={ClientColumns}
        onRowClick={(row) =>
          router.push(
            `/organizations/${params["organization-id"]}/clients/${row.id}`,
          )
        }
        getData={async r => {
          const res = await getSupabaseRows({
            supabase,
            table: "clients",
            select: "*, favorites(*), links:clients_projects(*, project:projects(*))",
            filters: [
              {
                column: "organization_id",
                operator: "eq",
                value: params["organization-id"]
              },
            ]
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
    </ObjectPage>
  );
}
