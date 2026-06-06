import { createServerClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@packages/ui/components/page";
import Body from "./page-body";



export default async function(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  params: Promise<{
    "organization-id": string;
    "file-id": string;
  }>;
}) {

  const apiBase = process.env.PROJDOCS_API_URL;
  if (!apiBase) {
    return <ErrorPage title={"Configuration Error"} description={"`PROJDOCS_API_URL` is not set"} />;
  }

  const searchParams = await props.searchParams;
  const versionID = searchParams["version-id"];
  if (versionID !== undefined && typeof versionID !== "string") return (
    <ErrorPage title={"Invalid `version-id`"} description={"`version-id` is not a string"} />
  );

  const params = await props.params;
  const supabase = await createServerClient();
  const { data: file, error } = await supabase
    .from("files")
    .select()
    .eq("id", params["file-id"])
    .single();
  if (error) return (
    <ErrorPage
      title={"Unable to Load File!"}
      description={error.message ?? "An unexpected error occurred."}
    />
  );

  const { data: versions, error: versionsError } = await supabase
    .from("files_versions")
    .select()
    .eq("files_id", params["file-id"])
    .order("number", { ascending: false });
  if (versionsError) return (
    <ErrorPage
      title={"Unable to Load File Versions!"}
      description={versionsError.message ?? "An unexpected error occurred."}
    />
  );

  const viewingVersion = versionID === undefined ? versions[0] : versions.find(v => v.id === versionID);
  if (viewingVersion === undefined) return (
    <ErrorPage title={"Unable to Load File Version!"} description={`Version (id=\`${versionID}\`) was not found!`} />
  );

  return (
    <Body
      file={file}
      version={viewingVersion}
      versions={versions}
      apiURL={apiBase}
      organizationID={params["organization-id"]}
      can={{
        edit: (
          await supabase.rpc("check_folder_permissions", {
            folder_id: file.folder_id,
            access_level: "EDIT",
          }).then(({ data, error }) => {
            if (error) console.error(error);
            return data ?? false;
          })
        ),
        delete: (
          await supabase.rpc("check_folder_permissions", {
            folder_id: file.folder_id,
            access_level: "DELETE",
          }).then(({ data, error }) => {
            if (error) console.error(error);
            return data ?? false;
          })
        ),
      }}
    />
  );

}