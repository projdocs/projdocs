import { FileViewerProps } from "@apps/web/components/file-viewer/types";
import { Database, Tables } from "@packages/supabase";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { supabase } from "@apps/web/lib/supabase/client";
import { toast } from "sonner";
import { useEventListener } from "@packages/ui/hooks/use-event-listener";
import { CreateFolderDialog } from "@apps/web/components/create-folder-dialog";
import { Card } from "@packages/ui/components/card";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@packages/ui/components/button";
import { FileViewerSkeleton } from "@apps/web/components/file-viewer/skeleton";
import { FileViewerPrimitive } from "@apps/web/components/file-viewer/primitive";



export const ObjectFileViewerPrimitive = <T extends keyof Database["public"]["Tables"]>({ object, table, column, ...props }: Omit<FileViewerProps, "items"> & {
  table: T;
  object: Tables<T> extends { id: string; } ? Tables<T> : never;
  column: string & keyof Tables<"folders">;
}) => {

  const [ loading, setLoading ] = useState<boolean>(true);
  const [ folders, _setFolders ] = useState<readonly Tables<"folders">[] | null | undefined>();
  const setFolders = useDebouncedCallback((folders: readonly Tables<"folders">[] | null) => {
    _setFolders(folders);
    setLoading(false);
  }, 500);
  const getFolders = async () => {
    setLoading(true);
    await supabase()
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


  useEffect(() => {(async () => await getFolders())();}, []);
  useEventListener(CreateFolderDialog.RefreshEvent, getFolders);
  useEventListener(FileViewerPrimitive.RefreshEvent, getFolders);

  return (
    <div className="flex flex-col flex-1 h-full">
      <Card className="relative h-full p-0 flex flex-col flex-1 min-h-0 overflow-hidden gap-0">
        {folders !== undefined && loading && (
          <div className="z-50 absolute inset-0 backdrop-blur-[2px] bg-background/20" />
        )}
        {folders === undefined ? (
          <FileViewerSkeleton />
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
          <FileViewerPrimitive
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