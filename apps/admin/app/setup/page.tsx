import { SetupProjDocs } from "src/components/setup-projdocs";
import { kv } from "@workspace/admin/lib/db/kv.ts";
import { redirect } from "next/navigation";
import { KvKeys } from "@workspace/admin/lib/db/enum.ts";
import os from "node:os";



export default async function SetupProjDocsServer() {

  const initdb = !kv.get(KvKeys.DB_INIT);
  if(!initdb) return redirect("/dashboard");

  return (
    <SetupProjDocs platform={os.platform()} />
  )
}