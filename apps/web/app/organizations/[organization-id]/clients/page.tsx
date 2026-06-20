import Body from "./page-body";
import { Enums } from "@packages/supabase/types.gen";
import { createServerClient } from "@apps/web/lib/supabase/server";
import { connection } from "next/server";



export default async function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {
  await connection();
  const params = await props.params;
  const apiURL = process.env.PROJDOCS_API_URL;
  const permissions = await (await createServerClient()).from("members").select("*, permissions:permissions_id!inner(*)").eq("permissions.organization_id", params["organization-id"]).single();

  return (
    <Body
      apiURL={apiURL}
      canCreate={([ "EDIT", "DELETE" ] as Enums<"permission_levels">[]).includes(permissions.data?.permissions?.clients ?? "NONE")}
      organizationID={params["organization-id"]}
    />
  );

}
