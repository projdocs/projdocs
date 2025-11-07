import { H1, Link, P } from "@workspace/ui/components/text";
import { FileBrowser } from "@workspace/web/components/file-browser";
import { PageContent } from "@workspace/ui/components/page-content";
import { Tables } from "@workspace/supabase/types.gen";
import { FolderUpIcon } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import * as React from "react";
import { useEffect, useState } from "react";
import { SupabaseClient } from "@workspace/supabase/types";



type DirectoryPageState = undefined | null | {
  client: Tables<"clients">;
  project: Tables<"projects">;
  directory: Tables<"directories">;
}

export const DirectoryPage = (props: {
  navigate: (url: string) => void;
  clientID: string | number;
  projectID: string | number;
  directoryID: string;
  supabase: SupabaseClient;
  disableFileSelection?: boolean;
  disableDirectorySelection?: boolean;
}) => {

  const [ state, setState ] = useState<DirectoryPageState>(undefined);

  useEffect(() => {
    (async () => {

      const client = await props.supabase.from("clients").select().eq("id", typeof props.clientID === "string" ? Number(props.clientID) : props.clientID).single();
      if (client.error) {
        console.error(client.error);
        setState(null);
        return;
      }

      const project = await props.supabase.from("projects").select()
        .eq("project_number", typeof props.projectID === "string" ? Number(props.projectID) : props.projectID)
        .eq("client_id", typeof props.clientID === "string" ? Number(props.clientID) : props.clientID)
        .single();
      if (project.error) {
        console.error(project.error);
        setState(null);
        return;
      }

      const directory = await props.supabase.from("directories").select().eq("id", props.directoryID).single();
      if (directory.error) {
        console.error(directory.error);
        setState(null);
        return;
      }

      setState({
        client: client.data,
        project: project.data,
        directory: directory.data
      });

    })();
  }, [ props.clientID, props.directoryID, props.projectID ]);

  return (
    <PageContent>
      {!state ? (
        <div className={"flex flex-row w-full justify-center"}>
          <Spinner className={"size-16 text-secondary"}/>
        </div>
      ) : (
        <>
          <div className={"flex flex-col gap-2"}>
            <div className={"flex flex-row items-center gap-2"}>
              <Link
                className={"transition-colors"}
                href={`/dashboard/clients/${state.client.id}`}
                onClick={() => props.navigate(`/dashboard/clients/${state.client.id}`)}
              >
                {state.client.name}
              </Link>
              <P className={"text-secondary"}>{"·"}</P>
              <Link
                className={"transition-colors"}
                onClick={() => props.navigate(`/dashboard/clients/${state.client.id}/${state.project.project_number}`)}
                href={`/dashboard/clients/${state.client.id}/${state.project.project_number}`}
              >
                {state.project.name}
              </Link>
            </div>

            <div className={"flex flex-row items-center gap-2"}>
              <Button
                onClick={() => props.navigate(state.directory.parent_id === null ?
                  `/dashboard/clients/${state.client.id}/${state.project.project_number}` :
                  `/dashboard/clients/${state.client.id}/${state.project.project_number}/${state.directory.parent_id}`
                )}
                variant={"outline"}
                size={"icon"}
                className={"size-8"}
              >
                <FolderUpIcon/>
              </Button>
              <H1>{state.directory.name}</H1>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <FileBrowser
              navigate={props.navigate}
              client={state.client}
              project={state.project}
              directoryID={state.directory.id}
              supabase={props.supabase}
              disableDirectorySelection={props.disableDirectorySelection}
              disableFileSelection={props.disableFileSelection}
            />
          </div>
        </>
      )}
    </PageContent>
  );

};