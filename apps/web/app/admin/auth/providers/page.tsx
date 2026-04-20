import { AuthError, CustomProviderResponse } from "@supabase/auth-js";
import { createServiceRoleClient } from "@apps/web/lib/supabase/server";
import { v4 } from "uuid";
import { ObjectPage } from "@apps/web/components/page";
import OIDCConnectionForm from "@apps/web/app/admin/auth/providers/create-provider";
import OIDCProvidersTable from "@apps/web/app/admin/auth/providers/providers-table";
import { isAdmin } from "@apps/web/lib/utils-server";

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
            if (!(await isAdmin()))
              return {
                data: null,
                error: new AuthError("unauthorized", 401),
              } satisfies CustomProviderResponse;
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

          if (!(await isAdmin()))
            return {
              data: null,
              error: new AuthError("unauthorized", 401),
            } satisfies CustomProviderResponse;

          const supabase = await createServiceRoleClient();
          return await supabase.auth.admin.customProviders.updateProvider(
            provider.identifier,
            provider
          );
        }}
      />
    </ObjectPage>
  );
}
