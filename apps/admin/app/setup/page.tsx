import { Card, CardContent, CardHeader } from "@packages/ui/components/card";
import { H2, H3, H4 } from "@packages/ui/components/typography";
import { Badge } from "@packages/ui/components/badge";
import { Tables } from "@packages/supabase";
import { cn } from "@packages/ui/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { CreateAuthenticationProviderDialog } from "@apps/web/components/create-authentication-provider-dialog";



export default function() {

  const providers: Tables<{ schema: "auth" }, "custom_oauth_providers">[] = [];


  return (
    <Card className={"w-full max-w-md"}>
      <CardHeader>
        <H2>{"Setup ProjDocs"}</H2>
      </CardHeader>
      <CardContent>

        <div className={"flex flex-col w-full gap-4"}>
          <div className={"flex flex-col w-full"}>
            <div className={"flex flex-row items-center justify-between w-full"}>
              <H3>{"Authentication"}</H3>
              <Badge
                variant={providers.length === 0 ? "destructive" : "outline"}
                className={cn("", providers.length > 0 && "outline-green-500")}
              >
                {"Not Started"}
              </Badge>
            </div>
            <p
              className={"text-muted-foreground"}>{"Control how users access ProjDocs."}</p>
          </div>

          <div className={"flex flex-col w-full gap-1"}>
            <div className={"flex flex-col w-full"}>
              <div className={"flex flex-row items-center justify-between w-full"}>
                <H4>{"Providers"}</H4>

                <CreateAuthenticationProviderDialog
                  kongURL={process.env.SUPABASE_KONG_URL ?? window.location.host}
                  trigger={{
                    size: "xs",
                    children: "Create",
                  }}
                />
              </div>
              <p
                className={"text-muted-foreground"}>{"ProjDocs integrates directly with any third-party OIDC authentication provider."}</p>
            </div>

            {providers.length === 0 && (
              <Alert variant={"destructive"}>
                <AlertTitle>{"No provider configured!"}</AlertTitle>
                <AlertDescription>{"Configure at least one authentication provider to continue."}</AlertDescription>
              </Alert>
            )}
          </div>

        </div>

      </CardContent>
    </Card>
  );
}