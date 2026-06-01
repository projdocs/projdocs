import { createServerClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@packages/ui/components/page";



export default async function (props: {
  params: Promise<{
    "organization-id": string;
    "file-id": string;
    "version-id": string;
  }>;
}) {

  const params = await props.params;

  const {data: version, error} = await (await createServerClient())
    .from("files_versions")
    .select()
    .eq("id", params["version-id"])
    .eq("files_id", params["file-id"])
    .single();

  if (error) return (
    <ErrorPage
      title={"Unable to Load File!"}
      description={error.message ?? "An unexpected error occurred."}
    />
  )

  return null;

}