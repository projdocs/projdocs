"use client";

import { Tables } from "@packages/supabase/types.gen";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@packages/ui/components/card";

export const OrgCard = ({
  organization,
}: {
  organization: Tables<"organizations">;
}) => {
  const router = useRouter();

  return (
    <Card
      className={
        "w-full max-w-sm cursor-pointer transition-colors hover:bg-muted"
      }
      onClick={() => router.push(`/organizations/${organization.id}`)}
    >
      <CardHeader className={"w-full"}>
        <CardTitle>{organization.display}</CardTitle>
      </CardHeader>
    </Card>
  );
};
