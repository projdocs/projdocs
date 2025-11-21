import DashboardLayout from "@workspace/admin/layout/dashboard.tsx";
import { ReactNode } from "react";
import { kv } from "@workspace/admin/lib/db/kv.ts";
import { redirect } from "next/navigation";
import { KvKeys } from "@workspace/admin/lib/db/enum.ts";



export default async function Layout({children}: {
  children: ReactNode;
}) {

  const initdb = !kv.get(KvKeys.DB_INIT);
  if(initdb) return redirect("/setup");

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}