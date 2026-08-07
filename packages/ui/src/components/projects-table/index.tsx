"use client";

import { ProjectColumns, PROJECTS_TABLE_REFRESH_EVENT } from "@packages/ui/components/projects-table/cols";
import { Filters, getSupabaseRows } from "@packages/supabase/lib/utils";
import { Tables } from "@packages/supabase";
import { PaginatedDataTable } from "@packages/ui/components/data-table";
import { useLibraryRouter } from "@packages/ui/routing";
import { useLibrarySupabase } from "@packages/ui/lib/supabase-adapter";



export const ProjectsTable = (props: {
  organizationID: string;
  filters?: Filters<"projects">;
  select?: string;
}) => {
  const router = useLibraryRouter();
  const supabase = useLibrarySupabase();
  return (
    <PaginatedDataTable
      className={"pb-8"}
      refreshEvent={PROJECTS_TABLE_REFRESH_EVENT}
      columns={ProjectColumns}
      onRowClick={(row) =>
        router.navigate(
          `/organizations/${props.organizationID}/projects/${row.id}`,
        )
      }
      getData={async r => {
        const res = await getSupabaseRows({
          supabase: () => supabase,
          table: "projects",
          select: props.select ?? "*, favorites(*), client:clients(*)",
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
          rows: res.rows,
        });
      }}
    />
  );
};

ProjectsTable.RefreshEvent = PROJECTS_TABLE_REFRESH_EVENT;

