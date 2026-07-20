"use client";

import { use } from "react";
import { FavoriteClientsPage } from "@packages/ui/routing/pages/clients-favorites";



export default function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {
  const params = use(props.params);

  return (
    <FavoriteClientsPage
      organizationID={params["organization-id"]}
    />
  );
}
