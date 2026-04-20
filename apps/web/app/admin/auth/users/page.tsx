import { ObjectPage } from "@apps/web/components/page";
import { createServiceRoleClient } from "@apps/web/lib/supabase/server";
import UsersTable from "@apps/web/app/admin/auth/users/users-table";
import { AuthError, CustomProviderResponse } from "@supabase/auth-js";
import { isAdmin } from "@apps/web/lib/utils-server";

export default async function () {
  return (
    <ObjectPage
      title={"Users"}
      description={"View all users who have authenticated into ProjDocs."}
    >
      <UsersTable
        getRowsAction={async (props) => {
          "use server";
          if (!(await isAdmin())) throw new Error("unauthorized");

          const supabase = await createServiceRoleClient();

          const count = await supabase.rpc("get_user_count");
          if (count.error || count.data === null) {
            console.error(count.error ?? "no users found");
            return {
              rows: [],
              count: 0,
            };
          }

          const result = await supabase.auth.admin.listUsers({
            page: props.pagination.pageIndex,
            perPage: props.pagination.pageSize,
          });
          if (result.error)
            return {
              rows: [],
              count: 0,
            };

          return {
            rows: result.data.users,
            count: count.data,
          };
        }}
      />
    </ObjectPage>
  );
}
