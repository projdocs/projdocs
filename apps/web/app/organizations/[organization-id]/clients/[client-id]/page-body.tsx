"use client";

import { ClickToCopyID } from "@packages/ui/components/id-value";
import { Button } from "@packages/ui/components/button";
import { ObjectPage } from "@packages/ui/components/page";
import { Tables } from "@packages/supabase";



export const ClientPageBody = (props: {
  client: Tables<"clients">;
}) => {
  return (
    <ObjectPage
      title={props.client.name}
      description={(
        <ClickToCopyID>
          {props.client.id}
        </ClickToCopyID>
      )}
      action={(
        <Button variant={"outline"}>
          {"Edit Client"}
        </Button>
      )}
    />
  )
}