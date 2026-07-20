"use client";

import { use } from "react";
import { FavoriteProjectsPage } from "@packages/ui/routing/pages/projects-favorites";



export default function(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {
  const params = use(props.params);

  return (
    <FavoriteProjectsPage organizationID={params["organization-id"]} />
  );
}
