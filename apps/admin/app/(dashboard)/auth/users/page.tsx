import { ObjectPage } from "@packages/ui/components/page";
import UsersTable from "@apps/admin/app/(dashboard)/auth/users/users-table";
import { getUsersAction } from "@apps/admin/app/(dashboard)/auth/users/action";



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
