"use client";
import { ObjectPage } from "@packages/ui/components/page";
import { Tables } from "@packages/supabase";
import { useEffect } from "react";
import { toast } from "sonner";
import { H3 } from "@packages/ui/components/typography";
import { FileBrowser } from "@packages/ui/components/file-browser";
import { useLibraryRouter } from "@packages/ui/routing";



export type DashboardFile = Tables<"files"> & {
  versions: readonly Tables<"files_versions">[];
}

export type DashboardPageProps = {
  user: Tables<"profiles">;
  member: Tables<"members">;
  organizationID: string;
  apiURL: string;
  files: null | readonly DashboardFile[];
}

export function DashboardPage(props: DashboardPageProps) {

  const router = useLibraryRouter();

  useEffect(() => {
    if (typeof props.files === "undefined") toast.error("Unable to load recent files!");
  }, [ props.files?.length ]);

  return (
    <ObjectPage title={`Welcome back, ${props.user.first_name}!`}>
      <div className={"flex flex-col gap-4"}>

        <H3>{"Recent Files"}</H3>
        <FileBrowser.Folder.Primitive
          organizationID={props.organizationID}
          apiURL={props.apiURL}
          loading={false}
          retry={() => {}}
          items={{
            folders: [],
            files: props.files ?? [],
          }}
          onRowDoubleClick={(row) => router.navigate(`/organizations/${props.organizationID}/${row.type === "FILE" ? "files" : "folders"}/${row.id}`)}
          onRowClick={(row) => router.navigate(`/organizations/${props.organizationID}/${row.type === "FILE" ? "files" : "folders"}/${row.id}`)}
        />
      </div>
    </ObjectPage>
  );
}