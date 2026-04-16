"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { CustomOAuthProvider } from "@supabase/auth-js";
import { Switch } from "@workspace/ui/components/switch";
import { supabase } from "@/lib/supabase/client";
import { PaginatedDataTable } from "@workspace/ui/components/data-table";



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
      <div className={"w-full h-full flex flex-col items-center justify-center"}>
        <Switch checked={info.getValue()} size={"default"} />
      </div>
    ),
  }),
  newColumn.accessor("id", {
    header: "ID",
    cell: (info) => <code>{info.getValue()}</code>,
  }),
];

export default function OIDCProvidersTable({refreshEvent}: {
  refreshEvent?: string;
}) {
  return (
    <PaginatedDataTable<CustomOAuthProvider>
      refreshEvent={refreshEvent}
      __disable_pagination
      columns={columns}
      getData={async ({ sort }) => {
        const {
          data: { providers },
        } = await supabase().auth.admin.customProviders.listProviders();
        console.log(providers);
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
  )
}