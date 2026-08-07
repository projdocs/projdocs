"use client";

import { ObjectPage } from "@packages/ui/components/page";
import { ProjectsTable } from "@packages/ui/components/projects-table";



export type FavoriteProjectsPageProps = {
  organizationID: string;
}

export function FavoriteProjectsPage(props: FavoriteProjectsPageProps) {


  return (
    <ObjectPage title={"My Projects"}>
      <ProjectsTable
        organizationID={props.organizationID}
        select={"*, favorites!inner(*), client:clients(*)"}
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