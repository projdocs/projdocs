import { ObjectPage } from "@packages/ui/components/page";
import { ClientsTable } from "@apps/web/components/clients-table";
import { CreateClientDialog } from "@apps/web/components/create-client-dialog";



export default function(props: {
  organizationID: string;
  canCreate: boolean
}) {
  return (
    <ObjectPage
      title={"Clients"}
      action={props.canCreate ? (
        <CreateClientDialog organizationID={props.organizationID} />) : undefined
      }
    >
      <ClientsTable organizationID={props.organizationID} />
    </ObjectPage>
  );
}