import { createServiceRoleClient } from "@apps/web/lib/supabase/server";
import { ErrorPage, ObjectPage } from "@apps/web/components/page";
import { StorageProviderDrawer } from "@apps/web/components/drawers/storage-provider";

export default async function (props: {
  params: Promise<{
    ["organization-id"]: string;
  }>;
}) {
  const supabase = await createServiceRoleClient();
  const params = await props.params;
  const org = await supabase
    .from("organizations")
    .select()
    .eq("id", params["organization-id"])
    .single();

  if (org.error) {
    console.error(org.error);
    return <ErrorPage />;
  }

  return (
    <ObjectPage
      title={org.data.display}
      description={org.data.id}
      action={<StorageProviderDrawer />}
    ></ObjectPage>
  );
}
