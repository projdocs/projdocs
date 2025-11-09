"use client";
import { ReactNode } from "react";
import { DashboardLayout } from "@workspace/web/components/_layout";



export default async function LoginGuard({ children }: {
  children: ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );

}