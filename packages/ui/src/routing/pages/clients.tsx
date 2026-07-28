import { ObjectPage } from "@packages/ui/components/page";
import { ClientsTable } from "@packages/ui/components/clients-table";
import { CreateClientDialog } from "@packages/ui/components/create-client-dialog";



export type ClientsPageProps = {
  organizationID: string;
  canCreate: boolean
  projdocsApiUrl: string;
}

export function ClientsPage(props: ClientsPageProps) {
  return (
    <ObjectPage
      title={"Clients"}
      action={props.canCreate ? (
        <CreateClientDialog
          projdocsApiUrl={props.projdocsApiUrl}
          organizationID={props.organizationID}
        />
      ) : undefined
      }
    >
      <ClientsTable organizationID={props.organizationID} />
    </ObjectPage>
  );
}