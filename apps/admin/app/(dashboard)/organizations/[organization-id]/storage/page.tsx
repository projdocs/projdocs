import { OrganizationPage } from "@apps/admin/app/(dashboard)/organizations/[organization-id]/storage/content";
import { NIL } from "uuid";
import { getSupabaseRows } from "@packages/supabase/lib/utils";
import { createServiceRoleClient } from "@apps/admin/lib/supabase";
import { StorageProvider } from "@packages/shared/utilities/storage";
import { ErrorPage } from "@packages/ui/components/page";

export default async function (props: {
  params: Promise<{
    ["organization-id"]: string;
  }>;
}) {
  const supabase = await createServiceRoleClient();
  const params = await props.params;
  const org = await supabase
    .from("organizations")
    .select("*, storage_link:storage_links (*, storage_provider:storage_providers (*))")
    .eq("id", params["organization-id"])
    .single();

  if (org.error) {
    console.error(org.error);
    return <ErrorPage />;
  }

  const storage = await supabase
    .from("storage_providers")
    .select("id,type,is_valid");
  if (storage.error) {
    console.error(storage.error);
    return <ErrorPage />;
  }

  return (
    <OrganizationPage
      organization={org.data}
      storage={{
        providers: storage.data,
        initial: org.data.storage_link?.storage_provider
          ? org.data.storage_link.storage_provider
          : null,
        getLinksAction: async (props) => {
          "use server";
          const getRowsAction = getSupabaseRows({
            table: "storage_links",
            supabase: createServiceRoleClient,
            filters: [
              // only use the current provider
              {
                column: "storage_provider_id",
                operator: "eq",
                value: org.data.storage_link?.storage_provider?.id ?? NIL,
              },
              // the organization's link
              {
                column: "id",
                operator: "in",
                value: `("${ org.data.storage_link?.id ?? NIL }")`
              }
            ],
          });
          return getRowsAction(props);
        },
        onSetAction: async (id) => {
          "use server";
          const supabase = await createServiceRoleClient();

          const provider = await supabase
            .from("storage_providers")
            .select()
            .eq("id", id)
            .single();
          if (provider.error) throw new Error(provider.error.message);

          const storage = StorageProvider.from(provider.data);
          if (storage.error) throw new Error(storage.error);

          const { data, error } = (
            await storage.provider!.mkdir(org.data.id)
          ).toObject();
          if (error) throw new Error(error.message);

          const link = await supabase
            .from("storage_links")
            .insert({
              key: data,
              storage_provider_id: provider.data.id,
            })
            .select()
            .single();
          if (link.error) throw new Error(link.error.message);

          const update = await supabase
            .from("organizations")
            .update({
              storage_link_id: link.data.id,
            })
            .eq("id", org.data.id);
          if (update.error) {
            await supabase // try clean-up
              .from("storage_links")
              .delete()
              .eq("id", link.data.id);
            throw new Error(update.error.message);
          }
        },
      }}
    />
  );
}
