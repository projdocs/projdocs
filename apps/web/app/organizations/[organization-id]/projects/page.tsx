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
    <ObjectPage title={"Projects"}>
      <ProjectsTable organizationID={params["organization-id"]} />
    </ObjectPage>
  );
}
