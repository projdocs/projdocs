"use client";

import { H1, H2, H4 } from "@packages/ui/components/typography";
import Logo from "@packages/ui/branding/logo/logo";
import { Card, CardContent } from "@packages/ui/components/card";
import { ReactNode, Usable, use, useEffect, useState } from "react";
import { getProviders } from "@apps/web/app/setup/actions";
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { DataTable } from "@packages/ui/components/data-table";
import { createColumnHelper } from "@tanstack/react-table";
import { CircleAlertIcon, PlusIcon } from "lucide-react";
import { CreateAuthenticationProviderDrawer } from "@apps/web/components/create-authentication-provider-drawer";
import { Button } from "@packages/ui/components/button";
import * as React from "react";
import { createClient } from "@supabase/supabase-js";



const authProvider = createColumnHelper<NonNullable<Awaited<ReturnType<typeof getProviders>>["data"]>[number]>();
const authProviderColumns = [
  authProvider.accessor("display", {
    header: "Display",
  }),
];

const SetupGroup = ({ children, title, description }: { children: ReactNode, title: string, description: string }) => (
  <div className={"flex flex-col gap-4"}>

    <div className={"flex flex-col gap-0"}>
      <H2 className={"mb-0 pb-0"}>{title}</H2>
      <p className={"text-sm text-muted-foreground"}>{description}</p>
    </div>

    {children}
  </div>
);

const SetupGroupSection = ({ children, title, description, action }: {
  children: ReactNode,
  title: string,
  description: string
  action?: ReactNode
}) => (
  <div className={"flex flex-col gap-2"}>

    <div className={"flex flex-col"}>
      <div className={"flex flex-row items-center justify-between w-full"}>
        <H4>{title}</H4>
        {action}
      </div>
      <p className={"text-sm text-muted-foreground"}>{description}</p>
    </div>

    {children}
  </div>
);

export default function(props: {
  apiURL: string;
  kongURL: string;
  getProvidersPromise: Usable<Awaited<ReturnType<typeof getProviders>>>;
}) {

  const initialAuthProviders = use(props.getProvidersPromise);
  const [authProviders, setAuthProviders] = useState(initialAuthProviders);

  return (
    <div className={"bg-muted w-full h-full overflow-scroll flex flex-col items-center p-10"}>

      <Logo className={"w-75"} />
      <H1 className={"text-muted-foreground"}>{"Setup"}</H1>

      <Card className={"w-full max-w-2xl mt-8"}>
        <CardContent className={"flex flex-col gap-8"}>

          <SetupGroup
            title={"Authentication"}
            description={"Control how users access ProjDocs."}
          >
            <SetupGroupSection
              title={"Providers"}
              description={"Configure any OAuth/OIDC-compatible authentication provider. This is how your regular users will authenticate into ProjDocs."}
              action={(
                <CreateAuthenticationProviderDrawer
                  apiURL={props.apiURL}
                  kongURL={props.kongURL}
                  onCreate={(newP) => setAuthProviders(p => ({
                    ...p,
                    data: p === null ? p : [ ...p.data, { display: newP.name, ...newP } ]
                  }))}
                  trigger={(
                    <Button size={"xs"}>
                      <PlusIcon />
                      {"Add Provider"}
                    </Button>
                  )}
                />
              )}
            >
              {
                authProviders.error ? (
                    <Alert variant={"destructive"}>
                      <AlertTitle> <CircleAlertIcon /> {"Unable to Load Authentication Providers!"}</AlertTitle>
                      <AlertDescription>{authProviders.error}</AlertDescription>
                    </Alert>
                  ) :
                  authProviders.data!.length === 0 ? (
                      <Alert variant={"destructive"}>
                        <AlertTitle> <CircleAlertIcon /> {"No Authentication Provider!"}</AlertTitle>
                        <AlertDescription>{"At least one authentication provider is required."}</AlertDescription>
                      </Alert>
                    ) :
                    <DataTable columns={authProviderColumns} data={authProviders.data} />

              }
            </SetupGroupSection>
          </SetupGroup>

        </CardContent>
      </Card>

    </div>
  );
}