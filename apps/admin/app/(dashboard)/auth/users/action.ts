"use server";
import { PaginatedDataTableDataGetter } from "@packages/ui/components/data-table";
import { User } from "@supabase/auth-js";
import { createServiceRoleClient } from "@apps/admin/lib/supabase";

export const getUsersAction: PaginatedDataTableDataGetter<User> = async (
  props
) => {
  "use server";
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