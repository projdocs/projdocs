"use client";

import { H1, InlineCode } from "@workspace/ui/components/text";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createColumnHelper, TableOptions } from "@tanstack/react-table";
import { DataTable } from "@workspace/ui/components/data-table";
import { BackendAPI } from "@workspace/web/lib/api/client";
import { User } from "@supabase/supabase-js";
import { AdminUsersRequestBody, AdminUsersResponseBodySuccess } from "@workspace/web/app/api/v1/admin/users/route";
import { DateTime } from "luxon";
import { Tables } from "@workspace/supabase/types.gen";
import { createClient } from "@workspace/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Code, MoreVerticalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
import { useEventListener } from "@workspace/web/hooks/use-event-listener";



type UserModel = {
  auth: User;
  public: Tables<"users">;
}

const newColumn = createColumnHelper<UserModel>();

const columns: TableOptions<UserModel>["columns"] = [
  newColumn.display({
    id: "avatar",
    cell: ({ row }) => (
      <Avatar>
        <AvatarImage src={row.original.public.avatar_url ?? undefined}/>
        <AvatarFallback>{`${row.original.public.first_name.trim().at(0)}${row.original.public.last_name.trim().at(0)}`.toUpperCase()}</AvatarFallback>
      </Avatar>
    )
  }),
  newColumn.accessor("public.first_name", {
    header: "First Name"
  }),
  newColumn.accessor("public.last_name", {
    header: "Last Name",
  }),
  newColumn.accessor("auth.email", {
    header: "Email Address"
  }),
  newColumn.accessor("auth.created_at", {
    header: "Created",
    cell: ({ row }) => DateTime.fromISO(row.original.auth.created_at).toRelative()
  }),
  newColumn.accessor("auth.id", {
    header: "ID",
    cell: ({ row }) => (
      <div className={"flex flex-row justify-start"}>
        <InlineCode>{row.original.public.id}</InlineCode>
      </div>
    )
  }),
  // newColumn.display({
  //   id: "options",
  //   cell: ({ row }) => (
  //     <DropdownMenu>
  //       <DropdownMenuTrigger asChild>
  //         <Button size={"icon"} variant="ghost">
  //           <MoreVerticalIcon/>
  //         </Button>
  //       </DropdownMenuTrigger>
  //       <DropdownMenuContent>
  //         <DropdownMenuLabel>{"Options"}</DropdownMenuLabel>
  //         <DropdownMenuGroup>
  //           <DropdownMenuItem
  //             onClick={() => createClient().from("admins").delete().eq("id", row.original.id).select().maybeSingle().then(({
  //                                                                                                                            data,
  //                                                                                                                            error
  //                                                                                                                          }) => {
  //               if (data === null && error === null) toast.error("Cannot Demote Self!", { description: "You cannot demote your own account. Add another administrator, who can then demote your account to a standard user." });
  //               else if (error) toast.error("Unable to Demote User!", { description: error.message });
  //               else useEventListener.RemoteDispatch(REFRESH_EVENT, null);
  //             })}
  //           >
  //             {"Demote to Standard User"}
  //           </DropdownMenuItem>
  //         </DropdownMenuGroup>
  //       </DropdownMenuContent>
  //     </DropdownMenu>
  //   )
  // })
];

export default function Page() {

  const [ page, setPage ] = useState<number>(1);
  const [ perPage, setPerPage ] = useState<number>(10);
  const [ data, setData ] = useState<null | AdminUsersResponseBodySuccess & {
    data: UserModel[];
  }>();

  const refresh = (): void => {
    setData(undefined);
    BackendAPI()
      .post("/api/v1/admin/users", { page, perPage } satisfies AdminUsersRequestBody).then(async ({ data, status }) => {

      if (status !== 200) {
        toast.error("Unable to load users!", { description: "error" in data && typeof data.error === "string" ? `Error: ${data.error}` : "See the browser console for more details." });
        console.log(data);
        setData(null);
        return;
      }

      const resp: AdminUsersResponseBodySuccess = data;
      const users = await createClient().from("users").select().in("id", resp.users.map(u => u.id));
      if (users.error) {
        toast.error("Unable to load users!", { description: users.error.message });
        setData(null);
        return;
      }

      setData({
        ...data,
        data: users.data.map(u => ({ public: u, auth: resp.users.find(a => a.id === u.id)! })) satisfies UserModel[],
      });
    });

  };

  // load and refresh
  useEffect(refresh, [ page, perPage ]);

  // refresh on changes
  // useEventListener(REFRESH_EVENT, refresh);

  return (
    <div className={"flex flex-col p-6 gap-6"}>

      <div className={"flex flex-row gap-2 justify-between items-center"}>
        <H1>{"Users"}</H1>
        {/*<PromoteUserButton*/}
        {/*  onAdd={refresh}*/}
        {/*  users={users?.standard}*/}
        {/*/>*/}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
      />

    </div>
  );
}