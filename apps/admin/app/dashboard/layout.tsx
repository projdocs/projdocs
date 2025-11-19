import DashboardLayout from "@workspace/admin/layout/dashboard.tsx";
import { ReactNode } from "react";
import { kv, KvKeys } from "@workspace/admin/lib/db/kv.ts";
import { redirect } from "next/navigation";



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