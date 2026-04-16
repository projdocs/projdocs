"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { CustomOAuthProvider, CustomProviderResponse } from "@supabase/auth-js";
import { Switch } from "@packages/ui/components/switch";
import { supabase } from "@apps/web/lib/supabase/client";
import { PaginatedDataTable } from "@packages/ui/components/data-table";
import { useEventListener } from "@packages/ui/hooks/use-event-listener";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const UPDATE_PROVIDER_EVENT = "projdocs-admin-update-oidc-auth-provider";

const EnabledToggle = (props: {
  checked: boolean;
  provider: CustomOAuthProvider;
}) => {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    setClicked(false)
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
  )
}

const newColumn = createColumnHelper<CustomOAuthProvider>();

const columns = [
  newColumn.accessor("name", {
    header: "Display",
    cell: (info) => info.getValue(),
  }),
  newColumn.accessor("issuer", {
    header: "Issuer",
    cell: (info) => info.getValue(),
  }),
  newColumn.accessor("enabled", {
    header: "Enabled",
    cell: (info) => (
      <div className={"flex h-full w-full flex-col"}>
        <EnabledToggle checked={info.getValue()!} provider={info.row.original} />
      </div>
    ),
  }),
  newColumn.accessor("id", {
    header: "ID",
    cell: (info) => <code>{info.getValue()}</code>,
  }),
];

export default function OIDCProvidersTable({
  refreshEvent,
  onUpdateAction,
}: {
  refreshEvent: string;
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
    <PaginatedDataTable<CustomOAuthProvider>
      refreshEvent={refreshEvent}
      __disable_pagination
      columns={columns}
      getData={async ({ sort }) => {
        const {
          data: { providers },
        } = await supabase().auth.admin.customProviders.listProviders();

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
  );
}
