"use client";

import { PaginatedDataTable } from "@packages/ui/components/data-table";
import { Tables } from "@packages/supabase/types.gen";
import { getSupabaseRows } from "@packages/supabase/lib/utils";
import { supabase } from "@apps/web/lib/supabase/client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { ObjectPage } from "@packages/ui/components/page";
import {
  ProjectColumns,
  PROJECTS_TABLE_REFRESH_EVENT,
} from "../../../../components/projects-table/cols";
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
