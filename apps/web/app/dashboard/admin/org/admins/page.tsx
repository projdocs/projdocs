"use client";

import { H1, InlineCode } from "@workspace/ui/components/text";
import { useEffect, useState } from "react";
import { createClient } from "@workspace/supabase/client";
import { Tables } from "@workspace/supabase/types.gen";
import { toast } from "sonner";
import { createColumnHelper, TableOptions } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
import { MoreVerticalIcon } from "lucide-react";
import { DateTime } from "luxon";
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@workspace/ui/components/command";
import { DataTable } from "@workspace/ui/components/data-table";
import { useEventListener } from "@workspace/web/hooks/use-event-listener";



const REFRESH_EVENT = `SUPABASE_ADMIN_REFRESH_REQUEST`;


type User = Tables<"admins"> & {
  user: Tables<"users">;
}

const newColumn = createColumnHelper<User>();

const columns: TableOptions<User>["columns"] = [
  newColumn.display({
    id: "avatar",
    cell: ({ row }) => (
      <Avatar>
        <AvatarImage src={row.original.user.avatar_url ?? undefined}/>
        <AvatarFallback>{`${row.original.user.first_name.trim().at(0)}${row.original.user.last_name.trim().at(0)}`.toUpperCase()}</AvatarFallback>
      </Avatar>
    )
  }),
  newColumn.accessor("user.first_name", {
    header: "First Name"
  }),
  newColumn.accessor("user.last_name", {
    header: "Last Name",
  }),
  newColumn.accessor("created_at", {
    header: "Admin Since",
    cell: ({ row }) => DateTime.fromISO(row.original.created_at).toRelative()
  }),
  newColumn.accessor("user.id", {
    header: "ID",
    cell: ({ row }) => (
      <div className={"flex flex-row justify-between"}>
        <InlineCode>{row.original.user.id}</InlineCode>
      </div>
    )
  }),
  newColumn.display({
    id: "options",
    cell: ({ row }) => (
      <div className={"flex flex-row justify-end"}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={"icon"} variant="ghost">
              <MoreVerticalIcon/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{"Options"}</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => createClient().from("admins").delete().eq("id", row.original.id).select().maybeSingle().then(({
                                                                                                                               data,
                                                                                                                               error
                                                                                                                             }) => {
                  if (data === null && error === null) toast.error("Cannot Demote Self!", { description: "You cannot demote your own account. Add another administrator, who can then demote your account to a standard user." });
                  else if (error) toast.error("Unable to Demote User!", { description: error.message });
                  else useEventListener.RemoteDispatch(REFRESH_EVENT, null);
                })}
              >
                {"Demote to Standard User"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  })
];

const PromoteUserButton = (props: {
  onAdd: () => void;
  users: Tables<"users">[] | null | undefined;
}) => {

  const [ open, setOpen ] = useState<boolean>(false);
  const [ loading, setLoading ] = useState<boolean>(false);


  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button disabled={loading}>
          {"Promote User"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="right" align="start">
        <Command>
          <CommandInput placeholder="Promote user..."/>
          <CommandList>
            <CommandEmpty>{"No users found!"}</CommandEmpty>
            <CommandGroup>
              {(props.users ?? []).map(user => (
                <CommandItem
                  key={user.id}
                  value={user.full_name}
                  onSelect={() => {
                    setOpen(false);
                    setLoading(true);
                    createClient().from("admins").insert({ id: user.id }).select().single().then(({ error }) => {
                      if (error) toast.error("Unable to Promote User!", { description: error.message });
                      else props.onAdd();
                      setLoading(false);
                    });
                  }}
                >
                  {user.full_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

};

export default function Page() {

  const [ users, setUsers ] = useState<null | {
    standard: Tables<"users">[];
    admin: User[]
  }>();

  const refresh = (): void => {
    const supabase = createClient();
    supabase.from("admins").select("*, user:users (*)").then(async ({ data, error }) => {
      if (error) {
        toast.error("Unable to load users!", { description: error.message });
        setUsers(null);
        return;
      }

      const users = await supabase.from("users").select().not("id", "in", `(${data!.map(r => r.id).join(",")})`);
      if (users.error) {
        toast.error("Unable to load users!", { description: users.error.message });
        setUsers(null);
        return;
      }

      setUsers({
        admin: data,
        standard: users.data,
      });
    });
  };

  // load once on mount
  useEffect(refresh, []);

  // refresh on changes
  useEventListener(REFRESH_EVENT, refresh);

  return (
    <div className={"flex flex-col p-6 gap-6"}>

      <div className={"flex flex-row gap-2 justify-between items-center"}>
        <H1>{"Administrators"}</H1>
        <PromoteUserButton
          onAdd={refresh}
          users={users?.standard}
        />
      </div>

      <DataTable
        columns={columns}
        data={users?.admin ?? []}
      />

    </div>
  );
}