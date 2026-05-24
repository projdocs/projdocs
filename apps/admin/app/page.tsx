import { createServerClient } from "@apps/web/lib/subase/server";
import { ErrorPage } from "@packages/ui/components/page";
import { redirect } from "next/navigation";



export default async function() {

  const supabase = await createServerClient();

  const organizations = await supabase.from("organizations").select();
  if(organizations.error) return (
    <ErrorPage
      title={"Unable to load organizations"}
      description={organizations.error.message}
    />
  )

  if(organizations.data.length === 0) return redirect("/setup");

  return (null)

}