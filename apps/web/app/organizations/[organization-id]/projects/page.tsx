"use client";

import { PaginatedDataTable } from "@packages/ui/components/data-table";
import { getSupabaseRows } from "@packages/supabase/lib/utils";
import { supabase } from "@apps/web/lib/supabase/client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ObjectPage } from "@packages/ui/components/page";
import { Tables } from "@packages/supabase";
import {
  ProjectColumns,
  PROJECTS_TABLE_REFRESH_EVENT,
} from "@apps/web/app/organizations/[organization-id]/projects/cols";



export default function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {
  const params = use(props.params);
  const router = useRouter();

  return (
    <ObjectPage title={"Projects"}>
      <PaginatedDataTable
        className={"pb-8"}
        refreshEvent={PROJECTS_TABLE_REFRESH_EVENT}
        columns={ProjectColumns}
        onRowClick={(row) =>
          router.push(
            `/organizations/${params["organization-id"]}/projects/${row.id}`,
          )
        }
        getData={async r => {
          const res = await getSupabaseRows({
            supabase,
            table: "projects",
            select: "*, favorites(*), links:clients_projects(*, client:clients(*))",
          })(r);
          return ({
            count: res.count,
            rows: res.rows.map(r => {
              const row = (r as Tables<"projects"> & {
                favorites: Tables<"favorites">[]; links: readonly (Tables<"clients_projects"> & {
                  client: Tables<"clients">
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
