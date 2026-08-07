"use client";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Tables } from "@packages/supabase";
import { StarIcon, StarOffIcon } from "lucide-react";
import { Button } from "@packages/ui/components/button";
import { toast } from "sonner";
import { NIL } from "uuid";
import { useEventListener } from "@packages/ui/hooks/use-event-listener";
import { useState } from "react";
import { DateTime } from "luxon";
import { ClickToCopyID } from "@packages/ui/components/id-value";
import { Avatar, AvatarFallback, AvatarGroup } from "@packages/ui/components/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { P } from "@packages/ui/components/typography";
import { useLibrarySupabase } from "@packages/ui/lib/supabase-adapter";
import { useLibraryRouter } from "@packages/ui/routing";



export const PROJECTS_TABLE_REFRESH_EVENT = "projects:refresh";
type Column = Tables<"projects"> & {
  favorite_id: string | null;
  client: Tables<"clients">;
};

const FavoriteButton = ({ row }: { row: Column }) => {

  const supabase = useLibrarySupabase();

  const [ isHovered, setIsHovered ] = useState<boolean>(false);
  const [ clicked, setClicked ] = useState<boolean>(false);
  return (
    <Button
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setClicked(false);
      }}
      size={"icon-sm"} variant={"ghost"}
      onClick={async (e) => {
        e.stopPropagation();
        setClicked(true);
        if (row.favorite_id) {
          const { error } = await supabase.from("favorites").delete().eq("client_id", row.id);
          if (error) toast.error("Unable to Remove Favorite!", {
            description: error.message,
          });
          else useEventListener.RemoteDispatch(PROJECTS_TABLE_REFRESH_EVENT, null as unknown);
        } else {
          const { error } = await supabase.from("favorites").insert({
            user_id: NIL, // set in trigger
            project_id: row.id,
          }).select().single();
          if (error) toast.error("Unable to Add Favorite!", {
            description: error.message,
          });
          else useEventListener.RemoteDispatch(PROJECTS_TABLE_REFRESH_EVENT, null as unknown);
        }
      }}
    >
      {row.favorite_id ? (
        isHovered && !clicked ? (<StarOffIcon />) : (<StarIcon fill="currentColor" />)
      ) : (
        isHovered && !clicked ? (<StarIcon fill="currentColor" />) : (<StarIcon />)
      )}
    </Button>
  );
};


export const ClientsRow = ({ row: { original: { client } } }: {
  row: {
    original: Column
  }
}) => {
  const router = useLibraryRouter();
  return (
    <AvatarGroup>
      <Tooltip key={client.id}>
        <TooltipTrigger key={client.id} className={"cursor-pointer"}>
          <Avatar className={"hover:outline-accent-foreground hover:outline-1"} onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            router.navigate(`/organizations/${client.organization_id}/clients/${client.id}`);
          }} key={client.id}>
            <AvatarFallback>{client.name.trim().at(0)}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <P>{client.name}</P>
        </TooltipContent>
      </Tooltip>
    </AvatarGroup>
  );
};


export const column = createColumnHelper<Column>();
export const ProjectColumns = [
  column.accessor("number", {
    id: "number",
    maxSize: 50,
    header: "No.",
    enableSorting: true,
  }),
  column.accessor("display", { header: "Name" }),
  column.accessor("client", {
    header: "Client",
    cell: ClientsRow,
  }),
  column.accessor("created_at", {
    header: "Created",
    cell: ({ row: { original: row } }) => DateTime.fromISO(row.created_at).toRelative(),
  }),
  column.accessor("id", {
    header: "ID",
    cell: ({ row: { original: row } }) => <ClickToCopyID>{row.id}</ClickToCopyID>,
  }),
  column.accessor("__actions" as any, {
    header: "",
    enableSorting: false,
    enableResizing: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
    cell: ({ row }) => (
      <div className={"flex flex-row items-center justify-end w-full"}>
        <FavoriteButton row={row.original} />
      </div>
    ),
  }),
] as ColumnDef<Column>[];