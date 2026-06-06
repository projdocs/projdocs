import { createServerClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@packages/ui/components/page";
import { FolderPageBody } from "@apps/web/app/organizations/[organization-id]/folders/[folder-id]/client-side";
import { getFolder } from "@apps/web/app/organizations/[organization-id]/folders/[folder-id]/utils";



export default async function(props: {
  params: Promise<{
    "organization-id": string;
    "folder-id": string;
  }>;
}) {

  const apiBase = process.env.PROJDOCS_API_URL;
  if (!apiBase) {
    return <ErrorPage title={"Configuration Error"} description={"`PROJDOCS_API_URL` is not set"} />;
  }

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
    <FolderPageBody
      apiURL={apiBase}
      folder={folder.data}
      organizationID={params["organization-id"]}
    />
  );

}