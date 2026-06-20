import { createServerClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@packages/ui/components/page";
import {
  ProjectPage,
} from "@apps/web/app/organizations/[organization-id]/projects/[project-id]/client-side";
import { getProject } from "@apps/web/app/organizations/[organization-id]/projects/[project-id]/utils";
import { connection } from "next/server";



export default async function(props: {
  params: Promise<{
    "organization-id": string;
    "project-id": string;
  }>;
}) {

  await connection();
  const apiBase = process.env.PROJDOCS_API_URL;

  const params = await props.params;
  const project = await getProject(await createServerClient(), {
    projectID: params["project-id"],
    organizationID: params["organization-id"],
  });
  if (project.error) return (
    <ErrorPage
      title={"Unable to load project"}
      description={`Project "${params["project-id"]}" was not found or is not accessible.`}
    />
  );
  return <ProjectPage apiURL={apiBase} project={project.data} />;
}
