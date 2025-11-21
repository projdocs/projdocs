import { kv } from "@workspace/admin/lib/db/kv.ts";
import { redirect } from "next/navigation";
import { KvKeys } from "@workspace/admin/lib/db/enum.ts";



export default function RootPage() {
  const initdb = !kv.get(KvKeys.DB_INIT);
  if(initdb) return redirect("/setup");
  else return redirect("/dashboard");
}