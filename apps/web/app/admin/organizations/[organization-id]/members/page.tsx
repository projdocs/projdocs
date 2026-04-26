import { createServiceRoleClient } from "@apps/web/lib/supabase/server";
import { ErrorPage } from "@apps/web/components/page";
import { getUsersAction } from "@apps/web/app/admin/auth/users/action";
import { OrganizationMembersPage } from "@apps/web/app/admin/organizations/[organization-id]/members/client";
import { getSupabaseRows } from "@apps/web/lib/utils";

export default async function (props: {
  params: Promise<{
    ["organization-id"]: string;
  }>;
}) {
  const supabase = await createServiceRoleClient();
  const params = await props.params;
  const org = await supabase
    .from("organizations")
    .select(
      "*, storage_link:storage_links (*, storage_provider:storage_providers (*))"
    )
    .eq("id", params["organization-id"])
    .single();

  if (org.error) {
    console.error(org.error);
    return <ErrorPage />;
  }

  const members = await supabase
    .from("members")
    .select()
    .eq("organization_id", org.data.id);
  if (members.error) {
    console.error(members.error);
    return <ErrorPage />;
  }

  return (
    <OrganizationMembersPage
      initialOrganization={org.data}
      getUsersAction={getUsersAction}
      initialMembers={members.data}
      toggleMemberAutoAddAction={async (auto) => {
        "use server";
        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
          .from("organizations")
          .update({ auto_add_members: auto })
          .eq("id", org.data.id)
          .select()
          .single();
        if (error) throw new Error(`Unable to create user: ${error.message}`);
        return data;
      }}
      getProfilesAction={async (props) => {
        "use server";
        return getSupabaseRows({
          supabase: createServiceRoleClient,
          table: "profiles",
          filters: [
            { column: "organization_id", operator: "eq", value: org.data.id },
          ],
        })(props);
      }}
      createMemberAction={async (user) => {
        "use server";
        const supabase = await createServiceRoleClient();
        const { data, error } = await supabase
          .from("members")
          .insert({
            organization_id: org.data.id,
            user_id: user.id,
          })
          .select()
          .single();
        if (error) throw new Error(`Unable to create user: ${error.message}`);
        return data;
      }}
    />
  );
}
