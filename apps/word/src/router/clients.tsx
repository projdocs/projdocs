import { H1 } from "@workspace/ui/components/text";
import ClientsTable from "@workspace/ui/components/clients-table";
import React from "react";
import { Page } from "@workspace/word/components/page";
import { useSupabase } from "@workspace/word/lib/supabase/client";



export const Clients = () => {

  const supabase = useSupabase();

  supabase.from("users").select().then(console.log)

  return (
    <Page>
      <H1>{"Clients"}</H1>

      <ClientsTable clients={[]}/>
    </Page>
  );
}