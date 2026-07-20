import { createServerClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@packages/ui/components/page";
import { connection } from "next/server";
import { ClientPage } from "@packages/ui/routing/pages/client";



export default async function(props: {
  params: Promise<{
    "organization-id": string;
    "client-id": string;
  }>;
}) {

  await connection();
  const apiBase = process.env.PROJDOCS_API_URL;
  const params = await props.params;

  const client = await (await createServerClient())
    .from("clients")
    .select()
    .eq("id", params["client-id"])
    .eq("organization_id", params["organization-id"])
    .single();

  if (client.error) return <ErrorPage />;
  return <ClientPage client={client.data} apiURL={apiBase} />;
}
