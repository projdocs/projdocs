import { ErrorPage, ObjectPage } from "@apps/web/components/page";
import { createServerClient } from "@apps/web/lib/supabase/server";
import { Button } from "@packages/ui/components/button";

export default async function (props: {
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
  return <ObjectPage description={client.data.id}
  action={(
    <Button variant={"outline"}>
      {"Edit Client"}
    </Button>
  )}
  />;
}
