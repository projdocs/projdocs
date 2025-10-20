"use client";

import * as React from "react";
import { H1 } from "@workspace/ui/components/text";
import ClientsTable from "@workspace/ui/components/clients-table";
import { useRealtimeRows } from "@workspace/web/hooks/use-realtime-rows";



export default function Page() {

  const { rows: favorites } = useRealtimeRows({
    table: "favorites"
  });
  const { rows } = useRealtimeRows({
    table: "clients"
  });

  const ids = (favorites ?? []).filter(c => c.client_id !== null).reduce((a, c) => {
    if (a.includes(c.client_id as number)) return a;
    return [ ...a, c.client_id as number ];
  }, [] as number[]);
  const clients = (rows ?? []).filter(row => ids.includes(row.id));

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">

        <H1>{"My Clients"}</H1>

        <ClientsTable
          clients={clients}
          noRowsText={"Looks like you haven't added a client yet! Add one to continue."}
        />

      </div>
    </div>
  );
}