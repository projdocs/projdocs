import Body from "./page-body";
import { Enums } from "@packages/supabase/types.gen";
import { ErrorPage } from "@packages/ui/components/page";
import { createServerClient } from "@apps/web/lib/supabase/server";



export default async function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {
  const params = await props.params;

  const apiURL = process.env.PROJDOCS_API_URL;
  if (!apiURL) return (
    <ErrorPage
      title={"Improper Server Configuration"}
      description={"`PROJDOCS_API_URL` is not set but is required"}
    />
  );

  const permissions = await (await createServerClient()).from("members").select("*, permissions:permissions_id(*)").single();
  if (permissions.error) console.error(permissions.error);

  return (
    <Body
      apiURL={apiURL}
      canCreate={([ "EDIT", "DELETE" ] as Enums<"permission_levels">[]).includes(permissions.data?.permissions?.clients ?? "NONE")}
      organizationID={params["organization-id"]}
    />
  );

}
