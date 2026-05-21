import { createServerClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@packages/ui/components/page";
import { ClientPageBody } from "@apps/web/app/organizations/[organization-id]/clients/[client-id]/page-body";



export default async function(props: {
  params: Promise<{
    "organization-id": string;
    "client-id": string;
  }>;
}) {
  const params = await props.params;

  const client = await (await createServerClient())
    .from("clients")
    .select()
    .eq("id", params["client-id"])
    .eq("organization_id", params["organization-id"])
    .single();

  if (client.error) return <ErrorPage />;
  return <ClientPageBody client={client.data} />;
}
