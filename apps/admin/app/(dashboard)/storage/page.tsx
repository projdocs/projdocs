import { StorageProviderDrawer } from "@apps/admin/components/drawers/storage-provider";
import StorageProvidersTable from "@apps/admin/app/(dashboard)/storage/storage-providers-table";
import { ObjectPage } from "@packages/ui/components/page";
import { createServiceRoleClient } from "@apps/admin/lib/supabase";
import { getSupabaseRows } from "@packages/supabase/lib/utils";

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
