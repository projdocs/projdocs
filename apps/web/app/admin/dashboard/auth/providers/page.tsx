import OIDCConnectionForm from "@apps/web/app/admin/dashboard/auth/providers/_components/create-provider";
import { H2 } from "@packages/ui/components/typography";
import OIDCProvidersTable from "@apps/web/app/admin/dashboard/auth/providers/_components/providers-table";
import { isAdmin } from "@apps/web/lib/is-admin";
import { AuthError, CustomProviderResponse } from "@supabase/auth-js";
import { createServerClient, createServiceRoleClient } from "@apps/web/lib/supabase/server";
import { v4 } from "uuid";

export default function () {

  const refreshEvent = v4();

  return (
    <div className={"flex w-full flex-col gap-8 p-8"}>
      <div className={"flex flex-row items-center justify-between"}>
        <div className={"flex flex-col"}>
          <H2>{"Authentication Providers"}</H2>
          <p className={"text-muted-foreground"}>
            {
              "Configure a custom authentication provider to allow users to sign-in to ProjDocs."
            }
          </p>
        </div>
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
      </div>

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
          return await supabase.auth.admin.customProviders.updateProvider(provider.identifier, provider);
        }}
      />
    </div>
  );
}
