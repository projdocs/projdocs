import { createServerClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@packages/ui/components/page";
import { FolderPageBody } from "@apps/web/app/organizations/[organization-id]/folders/[folder-id]/client-side";
import { getFolder } from "@apps/web/app/organizations/[organization-id]/folders/[folder-id]/utils";
import { connection } from "next/server";



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
    <FolderPageBody
      folder={folder.data}
      organizationID={params["organization-id"]}
    />
  );

}