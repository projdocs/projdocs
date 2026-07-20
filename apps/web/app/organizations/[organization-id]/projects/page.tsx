import { createServerClient } from "@apps/web/lib/supabase/server";
import { Enums } from "@packages/supabase";
import { connection } from "next/server";
import { ProjectsPage } from "@packages/ui/routing/pages/projects";



export default async function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {

  await connection();
  const params = await props.params;

  const permissions = await (await createServerClient()).from("members").select("*, permissions:permissions_id!inner(*)").eq("permissions.organization_id", params["organization-id"]).single();

  return (
    <ProjectsPage
      apiURL={process.env.PROJDOCS_API_URL}
      canCreate={([ "EDIT", "DELETE" ] as Enums<"permission_levels">[]).includes(permissions.data?.permissions?.projects ?? "NONE")}
      organizationID={params["organization-id"]}
    />
  );
}
