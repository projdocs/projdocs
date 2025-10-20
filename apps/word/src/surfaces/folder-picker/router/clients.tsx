import { H1 } from "@workspace/ui/components/text";
import ClientsTable from "@workspace/ui/components/clients-table";
import React, { useEffect, useState } from "react";
import { Page } from "@workspace/word/components/page";
import { useSupabase } from "@workspace/word/lib/supabase/client";
import { Tables } from "@workspace/supabase/types";
import { useAppStore } from "@workspace/word/store/app";



export const Clients = () => {

  const [clients, setClients] = useState<readonly Tables<"clients">[] | null | undefined>(undefined);
  const supabase = useSupabase();
  const app = useAppStore();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("clients").select();
      if (error) console.error(error);
      setClients(data ?? null);
    })();
  }, [supabase]);



  return (
    <Page>
      <H1>{"Clients"}</H1>

      <ClientsTable
        clients={clients}
        onRowClick={() => app.navigate("/dashboard/clients/12345")}
      />
    </Page>
  );
}