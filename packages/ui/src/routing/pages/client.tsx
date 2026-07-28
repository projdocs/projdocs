"use client";

import { ClickToCopyID } from "@packages/ui/components/id-value";
import { Button } from "@packages/ui/components/button";
import { ObjectPage } from "@packages/ui/components/page";
import { Tables } from "@packages/supabase";
import { H3 } from "@packages/ui/components/typography";
import { FileBrowser } from "../../components/file-browser";
import { CreateFolderDialog } from "@packages/ui/components/dialogs/create-folder-dialog";
import { ProjectsTable } from "@packages/ui/components/projects-table";
import { useLibraryRouter } from "@packages/ui/routing/index";



export type ClientPageProps = {
  client: Tables<"clients">;
  apiURL: string;
}

export function ClientPage(props: ClientPageProps) {

  const router = useLibraryRouter();

  return (
    <ObjectPage
      title={props.client.name}
      description={(
        <ClickToCopyID>
          {props.client.id}
        </ClickToCopyID>
      )}
      action={(
        <Button variant={"outline"}>
          {"Edit Client"}
        </Button>
      )}
    >
      <div className={"flex flex-col w-full gap-8 pb-8"}>


        <div className={"flex flex-col gap-4"}>

          <div className={"flex flex-row gap-2 justify-between items-center"}>
            <H3>{"Files"}</H3>
            <CreateFolderDialog
              forOrganizationId={props.client.organization_id}
              client_id={props.client.id}
              apiURL={props.apiURL}
            />
          </div>

          <FileBrowser.Client
            client={props.client}
            onRowClick={({ path }) => router.navigate(path)}
            onRowDoubleClick={({ path }) => router.navigate(path)}
          />
        </div>


        <div className={"flex flex-col gap-4"}>
          <H3>{"Projects"}</H3>

          <ProjectsTable
            organizationID={props.client.organization_id}
            select={"*, links:clients_projects!inner(*, client:clients(*))"}
            filters={[
              {
                // @ts-expect-error PostgREST table join
                column: "links.client_id",
                value: props.client.id,
                operator: "eq",
              },
            ]}
          />
        </div>

      </div>
    </ObjectPage>
  );
}