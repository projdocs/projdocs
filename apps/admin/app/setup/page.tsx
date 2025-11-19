import { SetupProjDocs } from "src/components/setup-projdocs";
import { kv, KvKeys } from "@workspace/admin/lib/db/kv.ts";
import { redirect } from "next/navigation";



export default async function SetupProjDocsServer() {

  const initdb = !kv.get(KvKeys.DB_INIT);
  if(!initdb) return redirect("/dashboard");

  return (
    <SetupProjDocs />
  )
}