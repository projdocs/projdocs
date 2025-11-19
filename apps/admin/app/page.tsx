import { kv, KvKeys } from "@workspace/admin/lib/db/kv.ts";
import { redirect } from "next/navigation";



export default function RootPage() {
  const initdb = !kv.get(KvKeys.DB_INIT);
  if(initdb) return redirect("/setup");
  else return redirect("/dashboard");
}