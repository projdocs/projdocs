"use client";

import { useRouter } from "next/navigation";
import { Button } from "@packages/ui/components/button";



export const SelectOrgButton = () => {

  const router = useRouter();

  return (<Button onClick={() => router.push("/organizations")}>{"Select Organization"}</Button>);
};