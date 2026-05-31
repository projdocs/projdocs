"use client";

import { H1, H2, H4 } from "@packages/ui/components/typography";
import Logo from "@packages/ui/branding/logo/logo";
import { Card, CardContent } from "@packages/ui/components/card";
import * as React from "react";
import { ReactNode, Usable, use, useState } from "react";
import {
  getAuthProviders,
  GetAuthProvidersResult, getOrganizations,
  GetOrganizationsResult,
  getStorageProviders,
  GetStorageProvidersResult,
} from "@apps/web/app/setup/actions";
import { Alert, AlertDescription, AlertTitle } from "@packages/ui/components/alert";
import { DataTable } from "@packages/ui/components/data-table";
import { createColumnHelper } from "@tanstack/react-table";
import { Building2Icon, CircleAlertIcon, CloudSyncIcon, LucideIcon, PlusIcon, ShieldIcon } from "lucide-react";
import { CreateAuthenticationProviderDrawer } from "@apps/web/components/create-authentication-provider-drawer";
import { Button } from "@packages/ui/components/button";
import { StorageProviderTypes } from "@packages/shared/utilities/storage/type";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@packages/ui/components/tabs";
import { Badge } from "@packages/ui/components/badge";
import { DateTime } from "luxon";
import { CreateStorageProviderDrawer } from "@apps/web/components/create-storage-provider-drawer";
import { supabase } from "@apps/web/lib/supabase/client";
import { Checkbox } from "@packages/ui/components/checkbox";
import { CreateOrganizationDrawer } from "@apps/web/components/create-organization-drawer";



const authProvider = createColumnHelper<NonNullable<Awaited<ReturnType<typeof getAuthProviders>>["data"]>[number]>();
const authProviderColumns = [
  authProvider.accessor("display", {
    header: "Display",
  }),
];

const storageProvider = createColumnHelper<NonNullable<Awaited<GetStorageProvidersResult>["data"]>[number]>();
const storageProviderColumns = [
  storageProvider.accessor("display", {
    header: "Display",
  }),
  storageProvider.accessor("type", {
    header: "Type",
    cell: ({ getValue }) => StorageProviderTypes[getValue()],
  }),
  storageProvider.accessor("is_valid", {
    header: "Valid",
    cell: ({ getValue }) => (
      <Checkbox
        checked={getValue()}
        disabled
      />
    ),
  }),
  storageProvider.accessor("created_at", {
    header: "Created",
    cell: ({ getValue }) => DateTime.fromISO(getValue()).toRelative(),
  }),
];

const organization = createColumnHelper<NonNullable<Awaited<GetOrganizationsResult>["data"]>[number]>();
const organizationColumns = [
  organization.accessor("display", {
    header: "Display",
  }),
];

const SetupGroup = ({ children, title, description, action }: {
  children: ReactNode,
  title: string,
  description: string;
  action?: ReactNode
}) => (
  <div className={"flex flex-col gap-4"}>

    <div className={"flex flex-col gap-0"}>
      <div className={"flex flex-row items-center justify-between w-full"}>
        <H2 className={"mb-0 pb-0"}>{title}</H2>
        {action}
      </div>
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


enum StorageKeys {
  AUTH = "AUTH",
  STORAGE = "STORAGE",
  ORGS = "ORGS",
}

type tab = {
  display: string;
  icon: LucideIcon;
  key: StorageKeys;
}

const tabs: ReadonlyArray<tab> = [
  {
    display: "Auth",
    icon: ShieldIcon,
    key: StorageKeys.AUTH,
  },
  {
    display: "Storage",
    icon: CloudSyncIcon,
    key: StorageKeys.STORAGE,
  },
  {
    display: "Orgs",
    icon: Building2Icon,
    key: StorageKeys.ORGS,
  },
] as const;

const SetupTab = ({ tab, ...todos }: {
  [key in StorageKeys]: number;
} & {
  tab: tab
}) => (
  <TabsTrigger value={tab.key} className={"px-4"}>
    <tab.icon />
    {tab.display}
    {todos[tab.key] > 0 && (
      <Badge
        className="flex size-4 items-center justify-center rounded-full p-0 outline-destructive outline-1 bg-red-950 ml-1"
        variant="outline">
        <p className={"text-center w-full text-destructive"}>{todos[tab.key]}</p>
      </Badge>
    )}
  </TabsTrigger>
);

export default function(props: {
  apiURL: string;
  kongURL: string;
  getProvidersPromise: Usable<Awaited<GetAuthProvidersResult>>;
  getStorageProvidersPromise: Usable<Awaited<GetStorageProvidersResult>>;
  getOrganizationsPromise: Usable<Awaited<GetOrganizationsResult>>;
}) {

  const [ tab, setTab ] = useState<StorageKeys>(StorageKeys.AUTH);

  const initialStorageProviders = use(props.getStorageProvidersPromise);
  const [ storageProviders, setStorageProviders ] = useState<Awaited<GetStorageProvidersResult>>(initialStorageProviders);

  const initialAuthProviders = use(props.getProvidersPromise);
  const [ authProviders, setAuthProviders ] = useState<Awaited<GetAuthProvidersResult>>(initialAuthProviders);

  const initialOrganizations = use(props.getOrganizationsPromise);
  const [ organizations, setOrganizations ] = useState<Awaited<GetOrganizationsResult>>(initialOrganizations);

  return (
    <div className={"bg-muted w-full min-h-full overflow-scroll flex flex-col items-center p-10"}>

      <Logo className={"w-75"} />
      <H1 className={"text-muted-foreground"}>{"Setup"}</H1>

      <Card className={"w-full max-w-2xl mt-8 h-full"}>
        <CardContent className={"flex flex-col"}>

          <Tabs value={tab} onValueChange={(tab) => setTab(tab as StorageKeys)}>
            <TabsList className={"mb-8"}>
              {tabs.map((tab) => (
                <SetupTab
                  key={tab.key}
                  tab={tab}
                  AUTH={authProviders.data?.length ? 0 : 1}
                  STORAGE={0}
                  ORGS={organizations.data?.length ? 0 : 1}
                />
              ))}
            </TabsList>

            <TabsContent value={StorageKeys.AUTH}>
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
                      // @ts-expect-error
                      onCreate={(newP) => setAuthProviders(p => ({
                        ...p,
                        // @ts-expect-error
                        data: p === null ? p : [ ...p.data, { display: newP.name, ...newP } ],
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
                        <Alert variant={"destructive"} className={"flex flex-row gap-2"}>
                          <CircleAlertIcon />
                          <div>
                            <AlertTitle
                              className={"text-destructive font-bold"}>{"Unable to Load Authentication Providers!"}</AlertTitle>
                            <AlertDescription
                              className={"text-destructive"}>{authProviders.error}</AlertDescription>
                          </div>
                        </Alert>
                      ) :
                      authProviders.data === null || authProviders.data.length === 0 ? (
                          <Alert variant={"destructive"} className={"flex flex-row gap-2"}>
                            <CircleAlertIcon />
                            <div>
                              <AlertTitle
                                className={"text-destructive font-bold"}>{"No Authentication Provider!"}</AlertTitle>
                              <AlertDescription
                                className={"text-destructive"}>{"At least one authentication provider is required."}</AlertDescription>
                            </div>
                          </Alert>
                        ) :
                        <DataTable
                          columns={authProviderColumns}
                          data={authProviders.data}
                        />

                  }
                </SetupGroupSection>
              </SetupGroup>
            </TabsContent>

            <TabsContent value={StorageKeys.STORAGE}>
              <SetupGroup title={"Storage"} description={"Control how ProjDocs stores your files."}>
                <SetupGroupSection
                  title={"Providers"}
                  description={"Configure S3 or Google Drive storage backends. By default, the device's local storage will be used."}
                  action={(
                    <CreateStorageProviderDrawer
                      onCreateAction={async () => setStorageProviders(await getStorageProviders(supabase()))}
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
                    storageProviders.error ? (
                        <Alert variant={"destructive"} className={"flex flex-row gap-2"}>
                          <CircleAlertIcon />
                          <div>
                            <AlertTitle
                              className={"text-destructive font-bold"}>{"Unable to Load Storage Providers!"}</AlertTitle>
                            <AlertDescription
                              className={"text-destructive"}>{storageProviders.error.message}</AlertDescription>
                          </div>
                        </Alert>
                      ) :
                      <DataTable
                        columns={storageProviderColumns}
                        data={storageProviders.data}
                      />
                  }
                </SetupGroupSection>
              </SetupGroup>
            </TabsContent>


            <TabsContent value={StorageKeys.ORGS}>
              <SetupGroup
                title={"Organizations"}
                description={"Organizations are the top-level object where clients, projects, and files are stored. Each organization uses independent numbering schemes."}
                action={(
                  <CreateOrganizationDrawer
                    apiURL={props.apiURL}
                    providers={storageProviders.data}
                    onCreateAction={async () => setOrganizations(await getOrganizations(supabase()))}
                    trigger={(
                      <Button size={"sm"}>
                        <PlusIcon />
                        {"Create"}
                      </Button>
                    )}
                  />
                )}
              >
                {
                  organizations.error ? (
                    <Alert variant={"destructive"} className={"flex flex-row gap-2"}>
                      <CircleAlertIcon />
                      <div>
                        <AlertTitle
                          className={"text-destructive font-bold"}>{"Unable to Load Organizations!"}</AlertTitle>
                        <AlertDescription
                          className={"text-destructive"}>{organizations.error.message}</AlertDescription>
                      </div>
                    </Alert>
                  ) : organizations.data.length === 0 ? (
                    <Alert variant={"destructive"} className={"flex flex-row gap-2"}>
                      <CircleAlertIcon />
                      <div>
                        <AlertTitle
                          className={"text-destructive font-bold"}>{"No Organizations!"}</AlertTitle>
                        <AlertDescription
                          className={"text-destructive"}>{"At least one organization is required."}</AlertDescription>
                      </div>
                    </Alert>
                  ) : (
                    <DataTable
                      columns={organizationColumns}
                      data={organizations.data}
                    />
                  )
                }
              </SetupGroup>
            </TabsContent>


          </Tabs>
        </CardContent>
      </Card>

    </div>
  );
}