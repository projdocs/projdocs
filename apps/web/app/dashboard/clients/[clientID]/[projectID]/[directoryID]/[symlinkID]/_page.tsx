import { createClient } from "@workspace/web/lib/supabase/server";
import { redirect } from "next/navigation";
import { P } from "@workspace/ui/components/text";
import Link from "next/link";
import { NIL } from "uuid";
// import { FileViewer } from "@workspace/web/components/file-viewer/file-viewer";
import { PageContent } from "@workspace/ui/components/page-content";



export default async function Page(props: {
  params: Promise<{
    clientID: string;
    projectID: string;
    directoryID: string;
    symlinkID: string;
  }>;
}) {

  const supabase = await createClient();
  const { clientID, projectID, directoryID, symlinkID } = await props.params;

  const client = await supabase.from("clients").select().eq("id", Number(clientID)).single();
  const project = await supabase.from("projects").select().eq("client_id", Number(clientID)).eq("project_number", Number(projectID)).single();
  const directory = await supabase.from("directories").select().eq("project_id", project.data?.id ?? NIL).eq("id", directoryID).single();
  const symlink = await supabase.from("symlinks").select().eq("directory_id", directory.data?.id ?? NIL).eq("id", symlinkID).single();

  const file = await supabase.from("files").select().eq("id", symlink.data?.file_id ?? NIL).single();

  if (client.error || project.error || directory.error || symlink.error || file.error) redirect("/dashboard/clients");

  return (
    <PageContent className={"gap-2 md:gap-2"}>
      <div className="flex flex-row items-center gap-2">
        <Link href={`/dashboard/clients/${client.data.id}`}>
          <P className="cursor-pointer hover:underline">{client.data.name}</P>
        </Link>
        <P>{"·"}</P>
        <Link href={`/dashboard/clients/${client.data.id}/${project.data.project_number}`}>
          <P className="cursor-pointer hover:underline">{project.data.name}</P>
        </Link>
        <P>{"·"}</P>
        <Link href={`/dashboard/clients/${client.data.id}/${project.data.project_number}/${symlink.data.directory_id}`}>
          <P className="cursor-pointer hover:underline">{directory.data.name}</P>
        </Link>
      </div>

      {/*<FileViewer*/}
      {/*  project={project.data}*/}
      {/*  file={file.data}*/}
      {/*  directory={directory.data}*/}
      {/*/>*/}
    </PageContent>
  );
}