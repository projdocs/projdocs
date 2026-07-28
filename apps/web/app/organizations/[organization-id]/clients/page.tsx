import { Enums } from "@packages/supabase/types.gen";
import { createServerClient } from "@apps/web/lib/supabase/server";
import { connection } from "next/server";
import { ClientsPage } from "@packages/ui/routing/pages/clients";



export default async function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {
  await connection();
  const params = await props.params;
  const permissions = await (await createServerClient()).from("members").select("*, permissions:permissions_id!inner(*)").eq("permissions.organization_id", params["organization-id"]).single();

  return (
    <ClientsPage
      canCreate={([ "EDIT", "DELETE" ] as Enums<"permission_levels">[]).includes(permissions.data?.permissions?.clients ?? "NONE")}
      organizationID={params["organization-id"]}
      projdocsApiUrl={process.env.PROJDOCS_API_URL}
    />
  );

}
