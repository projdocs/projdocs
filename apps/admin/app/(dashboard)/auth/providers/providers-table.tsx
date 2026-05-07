"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { CustomOAuthProvider, CustomProviderResponse } from "@supabase/auth-js";
import { Switch } from "@packages/ui/components/switch";
import { PaginatedDataTable, PaginatedDataTableDataGetter } from "@packages/ui/components/data-table";
import { useEventListener } from "@packages/ui/hooks/use-event-listener";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { createServiceRoleClient } from "@apps/admin/lib/supabase";

const UPDATE_PROVIDER_EVENT = "projdocs-admin-update-oidc-auth-provider";

const EnabledToggle = (props: {
  checked: boolean;
  provider: CustomOAuthProvider;
}) => {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClicked(false);
  }, [props.provider.enabled]);

  return (
    <Switch
      disabled={clicked}
      size={"default"}
      checked={props.checked}
      onCheckedChange={async (enabled) => {
        setClicked(true);
        useEventListener.RemoteDispatch<CustomOAuthProvider>(
          UPDATE_PROVIDER_EVENT,
          {
            ...props.provider,
            enabled,
          }
        );
      }}
    />
  );
};

type Column = CustomOAuthProvider;

const column = createColumnHelper<Column>();
const columns = [
  column.accessor("name", {
    header: "Display",
  }),
  column.accessor("issuer", {
    header: "Issuer",
  }),
  column.accessor("enabled", {
    header: "Enabled",
    cell: (info) => (
      <div className={"flex h-full w-full flex-col"}>
        <EnabledToggle
          checked={info.getValue()!}
          provider={info.row.original}
        />
      </div>
    ),
  }),
  column.accessor("id", {
    header: "ID",
  }),
] as ColumnDef<Column>[];

export default function OIDCProvidersTable({
  refreshEvent,
  onUpdateAction,
  getProvidersAction
}: {
  refreshEvent: string;
  getProvidersAction: PaginatedDataTableDataGetter<Column>;
  onUpdateAction: (
    provider: CustomOAuthProvider
  ) => Promise<CustomProviderResponse>;
}) {
  useEffect(() => {
    console.log("mounting");
    return () => {
      console.log("unmounting");
    };
  }, []);

  useEventListener<CustomOAuthProvider>(UPDATE_PROVIDER_EVENT, (provider) =>
    toast.promise(
      onUpdateAction(provider).then(({ error }) => {
        if (error) {
          console.error(error);
          throw new Error("Unable to update provider!");
        } else useEventListener.RemoteDispatch<null>(refreshEvent, null);
      }),
      {
        loading: "Updating provider...",
        success: "Provider updated!",
        error: "Unable to update provider!",
      }
    )
  );

  return (
    <PaginatedDataTable<Column>
      refreshEvent={refreshEvent}
      __disable_pagination
      columns={columns}
      getData={getProvidersAction}
    />
  );
}
