import Body from "./page-body";
import { createServerClient } from "@apps/web/lib/supabase/server";
import { Enums } from "@packages/supabase";
import { ErrorPage } from "@packages/ui/components/page";
import { connection } from "next/server";



export default async function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {

  await connection();
  const params = await props.params;

  const apiURL = process.env.PROJDOCS_API_URL;
  if (!apiURL) return (
    <ErrorPage
      title={"Improper Server Configuration"}
      description={"`PROJDOCS_API_URL` is not set but is required"}
    />
  )

  const permissions = await (await createServerClient()).from("members").select("*, permissions:permissions_id!inner(*)").eq("permissions.organization_id", params["organization-id"]).single();

  return (
    <Body
      apiURL={apiURL}
      canCreate={([ "EDIT", "DELETE" ] as Enums<"permission_levels">[]).includes(permissions.data?.permissions?.projects ?? "NONE")}
      organizationID={params["organization-id"]}
    />
  );
}
