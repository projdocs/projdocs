import { ObjectPage } from "@apps/web/components/page";
import { StorageProviderDrawer } from "@apps/web/components/drawers/storage-provider";
import StorageProvidersTable from "@apps/web/app/admin/storage/storage-providers-table";
import { createServiceRoleClient } from "@apps/web/lib/supabase/server";
import { getSupabaseRows } from "@apps/web/lib/utils";

// <Badge
//   className={"px-8 py-3 font-bold"}
//   variant={storage.data?.is_valid ? "default" : "destructive"}
// >
//   {storage.data?.is_valid ? "Connected" : "Invalid"}
// </Badge>;

export default async function () {

  return (
    <ObjectPage
      title={"Storage Providers"}
      description={
        "Configure the storage backend used by ProjDocs for this organization. Providers are shared globally, but set at the organization level. Each organization can only have one active storage provider."
      }
      action={<StorageProviderDrawer />}
    >
      <StorageProvidersTable
        getRowsAction={async (props) => {
          "use server";
          const getRowsAction = getSupabaseRows({
            table: "storage_providers",
            supabase: createServiceRoleClient,
            omitColumns: ["data"] // don't send to client; sensitive
          });
          return getRowsAction(props);
        }}
      />
    </ObjectPage>
  );
}
