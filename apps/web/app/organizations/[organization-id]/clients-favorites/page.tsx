"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ObjectPage } from "@packages/ui/components/page";
import { ClientsTable } from "@apps/web/components/clients-table";



export default function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {
  const params = use(props.params);
  const router = useRouter();

  return (
    <ObjectPage title={"My Clients"}>
      <ClientsTable
        organizationID={params["organization-id"]}
        select={"*, favorites!inner(*), links:clients_projects(*, project:projects(*))"}
        filters={[
          {
            // @ts-expect-error PostgREST table join
            column: "favorites.project_id",
            value: null,
            operator: "not.is",
          },
        ]}
      />
    </ObjectPage>
  );
}
