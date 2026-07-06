"use client";

import { ClickToCopyID } from "@packages/ui/components/id-value";
import { Button } from "@packages/ui/components/button";
import { ObjectPage } from "@packages/ui/components/page";
import { Tables } from "@packages/supabase";
import { H3 } from "@packages/ui/components/typography";
import { FileViewer } from "@apps/web/components/file-viewer";
import { CreateFolderDialog } from "@apps/web/components/create-folder-dialog";
import { ProjectsTable } from "@apps/web/components/projects-table";
import { useRouter } from "next/navigation";



export const ClientPageBody = (props: {
  client: Tables<"clients">;
}) => {

  const router = useRouter();

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
            <CreateFolderDialog forOrganizationId={props.client.organization_id} client_id={props.client.id} />
          </div>

          <FileViewer.Client
            client={props.client}
            onRowClick={({path}) => router.push(path)}
            onRowDoubleClick={({path}) => router.push(path)}
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
};