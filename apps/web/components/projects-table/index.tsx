import { ProjectColumns, PROJECTS_TABLE_REFRESH_EVENT } from "@apps/web/components/projects-table/cols";
import { Filters, getSupabaseRows } from "@packages/supabase/lib/utils";
import { supabase } from "@apps/web/lib/supabase/client";
import { Tables } from "@packages/supabase";
import { PaginatedDataTable } from "@packages/ui/components/data-table";
import { useRouter } from "next/navigation";



export const ProjectsTable = (props: {
  organizationID: string;
  filters?: Filters<"projects">;
  select?: string;
}) => {
  const router = useRouter();
  return (
    <PaginatedDataTable
      className={"pb-8"}
      refreshEvent={PROJECTS_TABLE_REFRESH_EVENT}
      columns={ProjectColumns}
      onRowClick={(row) =>
        router.push(
          `/organizations/${props.organizationID}/projects/${row.id}`,
        )
      }
      getData={async r => {
        const res = await getSupabaseRows({
          supabase,
          table: "projects",
          select: props.select ?? "*, favorites(*), links:clients_projects(*, client:clients(*))",
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
  );
};

ProjectsTable.RefreshEvent = PROJECTS_TABLE_REFRESH_EVENT;

