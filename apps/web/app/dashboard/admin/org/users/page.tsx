"use client";

import { H1, InlineCode } from "@workspace/ui/components/text";
import { useState } from "react";
import { toast } from "sonner";
import { createColumnHelper, TableOptions } from "@tanstack/react-table";
import { PaginatedDataTable } from "@workspace/ui/components/data-table";
import { User } from "@supabase/supabase-js";
import { DateTime } from "luxon";
import { Tables } from "@workspace/supabase/types.gen";
import { createClient } from "@workspace/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { MoreVerticalIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
import { useEventListener } from "@workspace/web/hooks/use-event-listener";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
import { BackendAPI } from "@workspace/web/lib/api/client";
import { AxiosResponse } from "axios";
import { AdminUsersRequestBody, AdminUsersResponseBodySuccess } from "@workspace/web/app/api/v1/admin/users/route";



const REFRESH_EVENT = `SUPABASE_ADMIN_REFRESH_REQUEST`;

type UserModel = {
  auth: User;
  public: Tables<"users">;
}

const newColumn = createColumnHelper<UserModel>();

const Options = ({ row }: {
  row: {
    original: UserModel
  }
}) => {

  const [ menuOpen, setMenuOpen ] = useState<boolean>(false);
  const [ open, setOpen ] = useState<boolean>(false);

  return (
    <div className={"flex flex-row justify-end"}>
      <DropdownMenu onOpenChange={setMenuOpen} open={menuOpen || open}>
        <DropdownMenuTrigger asChild>
          <Button size={"icon"} variant="ghost">
            <MoreVerticalIcon/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{"Options"}</DropdownMenuLabel>
          <DropdownMenuGroup>
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem>
                  {`${row.original.public.is_suspended ? "Reinstate" : "Suspend"} User`}
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => createClient().from("users").update({ is_suspended: !row.original.public.is_suspended }).eq("id", row.original.public.id).select().single().then(({ error }) => {
                      if (error) toast.error(`Unable to ${row.original.public.is_suspended ? "Reinstate" : "Suspend"} User!`, { description: "Error: " + error.message });
                      else useEventListener.RemoteDispatch(REFRESH_EVENT, null);
                    })}
                  >
                    {"Continue"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <DropdownMenuItem

            >
              {"Delete User"}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const columns: TableOptions<UserModel>["columns"] = [
  newColumn.display({
    enableSorting: false,
    id: "avatar",
    cell: ({ row }) => (
      <Avatar>
        <AvatarImage src={row.original.public.avatar_url ?? undefined}/>
        <AvatarFallback>{`${row.original.public.first_name.trim().at(0)}${row.original.public.last_name.trim().at(0)}`.toUpperCase()}</AvatarFallback>
      </Avatar>
    )
  }),
  newColumn.accessor("public.first_name", {
    id: "users.public.first_name",
    header: "First Name",
  }),
  newColumn.accessor("public.last_name", {
    id: "users.public.last_name",
    header: "Last Name",
  }),
  newColumn.accessor("auth.email", {
    header: "Email Address",
    enableSorting: false,
  }),
  newColumn.accessor("public.is_suspended", {
    id: "users.public.is_suspended",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.public.is_suspended ? "destructive" : "default"}
      >
        {row.original.public.is_suspended ? "Suspended" : "Active"}
      </Badge>
    )
  }),
  newColumn.accessor("auth.created_at", {
    header: "Created",
    enableSorting: false,
    cell: ({ row }) => DateTime.fromISO(row.original.auth.created_at).toRelative()
  }),
  newColumn.accessor("auth.id", {
    enableSorting: false,
    header: "ID",
    cell: ({ row }) => (
      <div className={"flex flex-row justify-start"}>
        <InlineCode>{row.original.public.id}</InlineCode>
      </div>
    )
  }),
  newColumn.display({
    id: "options",
    cell: ({ row }) => (
      <Options row={row}/>
    ),
  })
];


export default function Page() {

  return (
    <div className={"flex flex-col p-6 gap-6"}>

      <div className={"flex flex-row gap-2 justify-between items-center"}>
        <H1>{"Users"}</H1>
        {/*<PromoteUserButton*/}
        {/*  onAdd={refresh}*/}
        {/*  users={users?.standard}*/}
        {/*/>*/}
      </div>

      <PaginatedDataTable<UserModel>
        columns={columns}
        refreshEvent={REFRESH_EVENT}
        getData={async (props) => {

          const from = props.pagination.pageIndex * props.pagination.pageSize;
          const to = from + props.pagination.pageSize - 1;


          const { data, error, count } = await createClient()
            .from("users")
            .select("*", { count: "exact" })
            .order(props.sort === null ? "created_at" : props.sort.id.split(".").pop()!, { ascending: !props.sort?.desc })
            .range(from, to)
            .abortSignal(props.abortSignal);

          if (error) {
            toast.error("Unable to load users!", {
              description: `Error: ${error.message}`,
            });
            return { count: 0, rows: [] };
          }

          const totalRows = count ?? 0;
          const backend = BackendAPI(true);

          // Chain upstream signal into axios' AbortSignal
          const ac = new AbortController();
          if (props.abortSignal.aborted) return { count: 0, rows: [] };
          else props.abortSignal.addEventListener("abort", () => ac.abort(), { once: true });

          try {
            const authResponses = await Promise.all(
              (data ?? []).map((user) =>
                backend.post<any, AxiosResponse<AdminUsersResponseBodySuccess>, AdminUsersRequestBody>(
                  "/api/v1/admin/users",
                  { id: user.id },
                  { signal: ac.signal }
                )
              )
            );

            const authById = new Map(authResponses.map((r) => [ r.data.user.id, r.data.user ] as const));

            return {
              count: totalRows,
              rows: (data ?? []).map(
                (d) =>
                  ({
                    public: d,
                    auth: authById.get(d.id)!
                  }) satisfies UserModel
              )
            }
          } catch (err) {
            ac.abort();
            toast.error("Unable to load users!", {
              description: "See the browser console for more details.",
            });
            console.error(err);
            return { count: 0, rows: [] };
          }
        }}
      />

    </div>
  );
}