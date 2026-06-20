"use client";

import { use } from "react";
import { ObjectPage } from "@packages/ui/components/page";
import { ProjectsTable } from "@apps/web/components/projects-table";



export default function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {
  const params = use(props.params);

  return (
    <ObjectPage title={"My Projects"}>
      <ProjectsTable
        organizationID={params["organization-id"]}
        select={"*, favorites!inner(*), links:clients_projects(*, client:clients(*))"}
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
