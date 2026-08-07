import { ClientsTable } from "@packages/ui/components/clients-table";
import { ObjectPage } from "@packages/ui/components/page";

export type FavoriteClientsPageProps = {
  organizationID: string;
}

export function FavoriteClientsPage(props: FavoriteClientsPageProps) {
  return (
    <ObjectPage title={"My Clients"}>
      <ClientsTable
        organizationID={props.organizationID}
        select={"*, favorites!inner(*), projects:projects!inner(*)"}
        filters={[
          {
            // @ts-expect-error PostgREST table join
            column: "favorites.client_id",
            value: null,
            operator: "not.is",
          },
        ]}
      />
    </ObjectPage>
  )
}