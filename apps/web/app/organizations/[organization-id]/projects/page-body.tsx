"use client";

import { CreateProjectDialog } from "@apps/web/components/create-project-dialog";
import { ProjectsTable } from "@apps/web/components/projects-table";
import { ObjectPage } from "@packages/ui/components/page";



export default function(props: {
  organizationID: string;
  apiURL: string;
  canCreate: boolean
}) {
  return (
    <ObjectPage
      title={"Projects"}
      action={props.canCreate ? (<CreateProjectDialog apiURL={props.apiURL} organizationID={props.organizationID} />) : undefined}
    >
      <ProjectsTable organizationID={props.organizationID} />
    </ObjectPage>
  )
}