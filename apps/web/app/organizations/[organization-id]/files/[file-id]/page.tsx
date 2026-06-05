import { createServerClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@packages/ui/components/page";



export default async function (props: {
  params: Promise<{
    "organization-id": string;
    "file-id": string;
  }>;
}) {

  const params = await props.params;
  const supabase = await createServerClient();
  const {data: file, error} = await supabase
    .from("files")
    .select()
    .eq("id", params["file-id"])
    .single();

  const {} = await supabase
    .from("files_versions")
    .select()
    .eq("files_id", params["file-id"])
    .order("created_at")

  if (error) return (
    <ErrorPage
      title={"Unable to Load File!"}
      description={error.message ?? "An unexpected error occurred."}
    />
  )

  return null;

}