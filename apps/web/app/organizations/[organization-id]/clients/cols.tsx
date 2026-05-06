import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Tables } from "@packages/supabase";
import { StarIcon, StarOffIcon } from "lucide-react";
import { Button } from "@packages/ui/components/button";
import { toast } from "sonner";
import { supabase } from "@apps/web/lib/supabase/client";
import { NIL } from "uuid";
import { useEventListener } from "@packages/ui/hooks/use-event-listener";
import { useState } from "react";


export const CLIENTS_TABLE_REFRESH_EVENT = "clients:refresh"
type Column = Tables<"clients"> & {
  favorite_id: string | null
};

const FavoriteButton = ({row}: {row: Column}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [clicked, setClicked] = useState<boolean>(false);
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
        if(row.favorite_id) {
          const { error } = await supabase().from("favorites").delete().eq("client_id", row.id);
          if (error) toast.error("Unable to Remove Favorite!", {
            description: error.message,
          });
          else useEventListener.RemoteDispatch(CLIENTS_TABLE_REFRESH_EVENT, null as unknown)
        } else {
          const { error } = await supabase().from("favorites").insert({
            user_id: NIL, // set in trigger
            client_id: row.id
          }).select().single();
          if (error) toast.error("Unable to Add Favorite!", {
            description: error.message,
          });
          else useEventListener.RemoteDispatch(CLIENTS_TABLE_REFRESH_EVENT, null as unknown)
        }
      }}
    >
      { row.favorite_id ? (
        isHovered && !clicked ? (<StarOffIcon />) : (<StarIcon fill="currentColor" />)
      ) : (
        isHovered && !clicked ? (<StarIcon fill="currentColor" />) : (<StarIcon />)
      ) }
    </Button>
  )
}

export const ClientColumn = createColumnHelper<Column>();
export const CLIENT_COLUMNS = [
  ClientColumn.accessor("id", { header: "ID" }),
  ClientColumn.accessor("__actions" as any, {
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