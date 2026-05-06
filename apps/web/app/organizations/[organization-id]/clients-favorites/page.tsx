"use client";

import { PaginatedDataTable } from "@packages/ui/components/data-table";
import { Tables } from "@packages/supabase/types.gen";
import { getSupabaseRows } from "@packages/supabase/lib/utils";
import { supabase } from "@apps/web/lib/supabase/client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ObjectPage } from "@packages/ui/components/page";
import {
  CLIENT_COLUMNS,
  CLIENTS_TABLE_REFRESH_EVENT,
} from "@apps/web/app/organizations/[organization-id]/clients/cols";



export default function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {
  const params = use(props.params);
  const router = useRouter();

  return (
    <ObjectPage title={"My Clients"}>
      <PaginatedDataTable
        refreshEvent={CLIENTS_TABLE_REFRESH_EVENT}
        columns={CLIENT_COLUMNS}
        onRowClick={(row) =>
          router.push(
            `/organizations/${params["organization-id"]}/clients/${row.id}`,
          )
        }
        getData={async r => {
          const res = await getSupabaseRows({
            supabase,
            table: "favorites",
            select: "id, client:clients(*)",
            filters: [
              {
                column: "client_id",
                operator: "not.is",
                value: null,
              },
            ],
          })(r);
          return ({
            count: res.count,
            rows: res.rows.map(r => {
              const row = (r as Tables<"favorites"> & { client: Tables<"clients"> });
              return {
                ...row.client,
                favorite_id: row.id,
              };
            }),
          });
        }}
      />
    </ObjectPage>
  );
}
