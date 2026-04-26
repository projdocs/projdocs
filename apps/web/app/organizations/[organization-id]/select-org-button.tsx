"use client";

import { Button } from "@packages/ui/components/button";
import { useRouter } from "next/navigation";

export const SelectOrgButton = () => {

  const router = useRouter();

  return (<Button onClick={() => router.push("/organizations")}>{"Select Organization"}</Button>);
};
