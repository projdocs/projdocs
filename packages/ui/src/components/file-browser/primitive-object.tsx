import { FileViewerProps } from "./types";
import { Database, Tables } from "@packages/supabase";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { useEventListener } from "@packages/ui/hooks/use-event-listener";
import { Card } from "@packages/ui/components/card";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@packages/ui/components/button";
import { FileBrowserSkeleton } from "./skeleton";
import { FileBrowserPrimitive } from "./primitive";
import { useLibrarySupabase } from "@packages/ui/lib/supabase-adapter";
import { CreateFolderDialog } from "@packages/ui/components/dialogs/create-folder-dialog";



export const ObjectFileBrowserPrimitive = <T extends keyof Database["public"]["Tables"]>({ object, table, column, ...props }: Omit<FileViewerProps, "items"> & {
  table: T;
  object: Tables<T> extends { id: string; } ? Tables<T> : never;
  column: string & keyof Tables<"folders">;
}) => {

  const supabase = useLibrarySupabase();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ folders, _setFolders ] = useState<readonly Tables<"folders">[] | null | undefined>();
  const setFolders = useDebouncedCallback((folders: readonly Tables<"folders">[] | null) => {
    _setFolders(folders);
    setLoading(false);
  }, 500);
  const getFolders = async () => {
    setLoading(true);
    await supabase
      .from("folders")
      .select("*")
      .eq(column, object.id)
      .then(({
               data,
               error,
             }) => {
        if (error) {
          toast.error("Unable to Load Folders!", {
            description: error.message,
          });
          setFolders(null);
        } else setFolders(data);
      });
  };


  useEffect(() => {(async () => await getFolders())();}, [object.id]);
  useEventListener(CreateFolderDialog.RefreshEvent, getFolders);
  useEventListener(FileBrowserPrimitive.RefreshEvent, getFolders);

  return (
    <div className="flex flex-col flex-1 h-full">
      <Card className="relative h-full p-0 flex flex-col flex-1 min-h-0 overflow-hidden gap-0">
        {folders !== undefined && loading && (
          <div className="z-50 absolute inset-0 backdrop-blur-[2px] bg-background/20" />
        )}
        {folders === undefined ? (
          <FileBrowserSkeleton />
        ) : folders === null ? (
          <div className={"flex flex-col items-center justify-center w-full h-full m-4 gap-2 bg-red-950"}>
            <AlertCircleIcon className={"text-destructive"} />
            <p className={"font-semibold text-destructive"}>{"Unable to Load Project's Folders!"}</p>
            <p>{"An unexpected error occurred while trying to load this project's folders."}</p>
            <Button className={"px-8 mt-8"} onClick={getFolders}>
              {"Retry"}
            </Button>
          </div>
        ) : (
          <FileBrowserPrimitive
            {...props}
            items={folders.map(folder => ({
              type: "FOLDER",
              id: folder.id,
              created_at: folder.created_at,
              name: folder.name,
              organization_id: props.organizationID,
              path: `/organizations/${props.organizationID}/folders/${folder.id}`
            }))}
          />
        )}
      </Card>
    </div>
  );
};