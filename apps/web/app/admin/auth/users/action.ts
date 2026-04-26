"use server";
import { PaginatedDataTableDataGetter } from "@packages/ui/components/data-table";
import { User } from "@supabase/auth-js";
import { isAdmin } from "@apps/web/lib/utils-server";
import { createServiceRoleClient } from "@apps/web/lib/supabase/server";

export const getUsersAction: PaginatedDataTableDataGetter<User> = async (
  props
) => {
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
};