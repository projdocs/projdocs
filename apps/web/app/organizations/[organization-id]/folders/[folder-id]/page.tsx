import { createServerClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@packages/ui/components/page";
import { connection } from "next/server";
import { FolderPage } from "@packages/ui/routing/pages/folder";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@packages/supabase";



const getFolder = (supabase: SupabaseClient<Database>, props: {
  folderID: string;
}) => supabase
  .from("folders")
  .select("*, client:clients(*), project:projects(*), organization:organizations(*), folder:folder_id(*)").eq("id", props.folderID)
  .single();

export default async function(props: {
  params: Promise<{
    "organization-id": string;
    "folder-id": string;
  }>;
}) {

  await connection();
  const params = await props.params;
  const folder = await getFolder(await createServerClient(), {
    folderID: params["folder-id"],
  });
  if (folder.error) return (
    <ErrorPage
      title={"Unable to load folder"}
      description={`Folder "${params["folder-id"]}" was not found or is not accessible.`}
    />
  );

  return (
    <FolderPage
      apiURL={process.env.PROJDOCS_API_URL}
      folder={folder.data}
      organizationID={params["organization-id"]}
    />
  );

}