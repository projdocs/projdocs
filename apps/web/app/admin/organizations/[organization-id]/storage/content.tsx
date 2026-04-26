"use client";

import { useState } from "react";
import { Tables } from "@packages/supabase/types.gen";
import { ObjectPage } from "@apps/web/components/page";
import { Card, CardContent, CardHeader } from "@packages/ui/components/card";
import { H2 } from "@packages/ui/components/typography";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/select";
import { StorageProviderTypes } from "@apps/web/lib/storage/type";
import { StorageProviderDrawer } from "@apps/web/components/drawers/storage-provider";
import { Button } from "@packages/ui/components/button";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@packages/ui/components/alert";
import {
  PaginatedDataTable,
  PaginatedDataTableDataGetter,
} from "@packages/ui/components/data-table";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

type Column = Tables<"storage_links">;

const column = createColumnHelper<Column>();
const columns = [
  column.accessor("storage_provider_id", {
    header: "Valid Configuration",
  }),
  column.accessor("id", {
    header: "ID",
  }),
] as ColumnDef<Column>[];

export const OrganizationPage = (props: {
  organization: Tables<"organizations">;
  storage: {
    onSetAction: (id: string) => Promise<void>;
    providers: readonly Pick<
      Tables<"storage_providers">,
      "is_valid" | "type" | "id"
    >[];
    initial: null | Pick<
      Tables<"storage_providers">,
      "is_valid" | "type" | "id"
    >;
    getLinksAction: PaginatedDataTableDataGetter<Column>;
  };
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const [provider, setProvider] = useState<null | Pick<
    Tables<"storage_providers">,
    "is_valid" | "type" | "id"
  >>(props.storage.initial);

  return (
    <ObjectPage
      title={"Storage"}
      description={`${props.organization.display} • ${props.organization.id}`}
    >
      <Card>
        <CardHeader>
          <H2 className={"pb-0"}>{"Provider"}</H2>
          <p className={"text-muted-foreground"}>
            {"Control how information is stored for this organization."}
          </p>
        </CardHeader>
        <CardContent className={"flex flex-col gap-8"}>
          <div className={"flex flex-row items-center justify-between gap-1"}>
            <div className={"flex flex-col"}>
              <p className={"font-bold"}>{"Current Provider"}</p>
              <p className={"text-muted-foreground"}>
                {
                  "Choose which storage backend to use. Providers are shared globally, but set at the organization level."
                }
              </p>
            </div>

            <Select
              disabled={loading || !!provider}
              value={provider?.id ?? ""}
              onValueChange={(id) => {
                setLoading(true);
                toast.promise(async () => await props.storage.onSetAction(id), {
                  loading: "Setting provider...",
                  success: () => {
                    setProvider(
                      props.storage.providers.find((p) => p.id === id) ?? null
                    );
                    setLoading(false);
                    return { message: "Provider set!" };
                  },
                  error: () => {
                    setLoading(false);
                    return { message: "Unable to Set Provider!" };
                  },
                });
              }}
            >
              <SelectTrigger className="w-full max-w-48">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{"Providers"}</SelectLabel>
                  {props.storage.providers.map((provider) => (
                    <SelectItem
                      disabled={!provider.is_valid}
                      key={provider.id}
                      value={provider.id}
                    >
                      {StorageProviderTypes[provider.type]}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <StorageProviderDrawer
                    trigger={
                      <Button className={"w-full"} variant={"ghost"}>
                        <PlusIcon />
                        {"Create Provider"}
                      </Button>
                    }
                  />
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {!!provider && (
            <Alert variant={"destructive"}>
              <AlertTitle>{"Switching Storage Providers Disabled!"}</AlertTitle>
              <AlertDescription>
                {
                  "ProjDocs does not currently support switching storage providers, since doing so will break all existing file links."
                }
              </AlertDescription>
            </Alert>
          )}

          <div className={"flex flex-col items-center justify-between gap-1"}>
            <div className={"flex flex-col"}>
              <p className={"font-bold"}>{"Migrate Providers"}</p>
              <p className={"text-muted-foreground"}>
                {
                  "To switch from one storage provider to another, you must migrate all existing files using the current provider to the new one."
                }
              </p>
            </div>

            <PaginatedDataTable
              columns={columns}
              getData={props.storage.getLinksAction}
            />
          </div>
        </CardContent>
      </Card>
    </ObjectPage>
  );
};
