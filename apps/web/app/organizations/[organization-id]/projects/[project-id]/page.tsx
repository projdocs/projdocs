import { createServerClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@packages/ui/components/page";
import {
  ProjectPage,
} from "@apps/web/app/organizations/[organization-id]/projects/[project-id]/client-side";
import { getProject } from "@apps/web/app/organizations/[organization-id]/projects/[project-id]/utils";



export default async function(props: {
  params: Promise<{
    "organization-id": string;
    "project-id": string;
  }>;
}) {
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
  return <ProjectPage project={project.data} />;
}
