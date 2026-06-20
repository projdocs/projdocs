import { createServerClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@packages/ui/components/page";
import { DashboardPageBody } from "@apps/web/app/organizations/[organization-id]/client-side";
import { connection } from "next/server";



export default async function Page(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {

  await connection();

  const params = await props.params;

  const apiBase = process.env.PROJDOCS_API_URL;
  if (!apiBase) {
    return <ErrorPage title={"Configuration Error"} description={"`PROJDOCS_API_URL` is not set"} />;
  }

  const supabase = await createServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) return (
    <ErrorPage title={"Unable to Load Session"}
               description={error ? error.message : "No error was thrown, but no session was found!"} />
  );

  const user = await supabase.from("profiles").select().eq("user_id", session.user.id).eq("organization_id", params["organization-id"]).single();
  if (user.error) return (
    <ErrorPage title={"Unable to Load User"} description={"User error: " + user.error.message} />
  );

  const member = await supabase.from("members").select("*, permission:permissions!inner(*)").eq("user_id", user.data.user_id).eq("permissions.organization_id", params["organization-id"]).single();
  if (member.error) return (
    <ErrorPage title={"Unable to Load User"} description={"Member error: " + member.error.message} />
  );
  return (
    <DashboardPageBody
      user={user.data}
      member={member.data}
      organizationID={params["organization-id"]}
      apiURL={apiBase}
    />
  );
}
