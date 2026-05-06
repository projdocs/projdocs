import { v4 } from "uuid";
import { ObjectPage } from "@packages/ui/components/page";
import OIDCConnectionForm from "@apps/admin/app/(dashboard)/auth/providers/create-provider";
import { createServiceRoleClient } from "@apps/admin/lib/supabase";
import OIDCProvidersTable from "@apps/admin/app/(dashboard)/auth/providers/providers-table";
import { CustomOAuthProvider } from "@supabase/auth-js";

export default function () {
  const refreshEvent = v4();

  return (
    <ObjectPage
      title={"Authentication Providers"}
      description={
        "Configure a custom authentication provider to allow users to sign-in to ProjDocs."
      }
      action={
        <OIDCConnectionForm
          refreshEvent={refreshEvent}
          KONG_URL={process.env.SUPABASE_KONG_URL}
          onCreateAction={async (formData) => {
            "use server";
            const supabase = await createServiceRoleClient();
            return await supabase.auth.admin.customProviders.createProvider({
              provider_type: "oidc",
              identifier: `custom:${v4()}`,
              name: formData.name,
              client_id: formData.client_id,
              client_secret: formData.client_secret,
              issuer: formData.issuer,
              scopes: ["openid", "profile", "email"],
            });
          }}
        />
      }
    >
      <OIDCProvidersTable
        refreshEvent={refreshEvent}
        onUpdateAction={async (provider) => {
          "use server";
          const supabase = await createServiceRoleClient();
          return await supabase.auth.admin.customProviders.updateProvider(
            provider.identifier,
            provider
          );
        }}
        getProvidersAction={async ({ sort }) => {
          "use server";
          const {
            data: { providers },
          } = await (
            await createServiceRoleClient()
          ).auth.admin.customProviders.listProviders();

          return {
            count: providers.length,
            rows: !sort
              ? providers
              : [...providers].sort((a, b) => {
                  const aVal = a[sort.id as keyof CustomOAuthProvider];
                  const bVal = b[sort.id as keyof CustomOAuthProvider];

                  if (aVal == null) return 1;
                  if (bVal == null) return -1;

                  if (aVal < bVal) return sort.desc ? 1 : -1;
                  if (aVal > bVal) return sort.desc ? -1 : 1;
                  return 0;
                }),
          };
        }}
      />
    </ObjectPage>
  );
}
