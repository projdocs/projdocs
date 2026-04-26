import { ObjectPage } from "@apps/web/components/page";
import UsersTable from "@apps/web/app/admin/auth/users/users-table";
import { getUsersAction } from "@apps/web/app/admin/auth/users/action";

export default async function () {
  return (
    <ObjectPage
      title={"Users"}
      description={"View all users who have authenticated into ProjDocs."}
    >
      <UsersTable getRowsAction={getUsersAction} />
    </ObjectPage>
  );
}
