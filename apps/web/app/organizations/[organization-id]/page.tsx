import { H1 } from "@packages/ui/components/typography";
import { createServerClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@apps/web/components/page";

export default async function Page(props: {
  params: Promise<{
    "organization-id": string;
  }>;
}) {

  const params = await props.params;

  const supabase = await createServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if(error || !session) return (
    <ErrorPage />
  )

  const user = await supabase.from("profiles").select().eq("user_id", session.user.id).eq("organization_id", params["organization-id"]).single();
  if(user.error) return (
    <ErrorPage />
  )

  return (
    <div className={"flex w-full flex-col p-16"}>
      <H1>{`Welcome back, ${user.data.first_name}!`}</H1>
    </div>
  );
}
