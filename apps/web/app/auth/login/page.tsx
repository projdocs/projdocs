import { createServiceRoleClient } from "@apps/web/lib/supabase/server";
import { LoginForm } from "./_components/login-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card";

export default async function () {

  // get auth provider
  const {
    data: { providers },
    error,
  } = await (
    await createServiceRoleClient({ __unsafe_ignore_admin_check: true })
  ).auth.admin.customProviders.listProviders();

  if (error)
    // unable to list providers
    return (
      <Card className={"w-full max-w-sm"}>
        <CardHeader>
          <CardTitle>{"Unexpected error!"}</CardTitle>
          <CardDescription>
            {
              "An unexpected error occurred while loading authentication providers!"
            }
          </CardDescription>
        </CardHeader>
      </Card>
    );
  else if (providers.length < 1)
    // no providers configured
    return (
      <Card className={"w-full max-w-sm"}>
        <CardHeader>
          <CardTitle>{"No Provider Connected!"}</CardTitle>
          <CardDescription>
            {
              "No authentication provider has been configured for this ProjDocs instance."
            }
          </CardDescription>
        </CardHeader>
      </Card>
    );
  else
    // show providers
    return (
      <LoginForm
        supabase={{
          url: process.env.SUPABASE_KONG_URL!,
          publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY!,
        }}
        providers={providers
          .filter((p) => p.enabled)
          .map((p) => ({
            id: p.id,
            identifier: p.identifier,
            name: p.name,
          }))}
      />
    );
}
