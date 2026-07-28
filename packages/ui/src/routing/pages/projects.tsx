"use client";

import { ObjectPage } from "@packages/ui/components/page";
import { ProjectsTable } from "@packages/ui/components/projects-table";
import { CreateProjectDialog } from "@packages/ui/components/dialogs/create-project-dialog";



export type ProjectsPageProps = {
  organizationID: string;
  canCreate: boolean
  apiURL: string;
}

export function ProjectsPage(props: ProjectsPageProps) {
  return (
    <ObjectPage
      title={"Projects"}
      action={props.canCreate ? (<CreateProjectDialog organizationID={props.organizationID} apiURL={props.apiURL} />) : undefined}
    >
      <ProjectsTable organizationID={props.organizationID} />
    </ObjectPage>
  )
}