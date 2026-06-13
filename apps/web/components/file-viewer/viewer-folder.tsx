import { FileViewerProps, Folder } from "@apps/web/components/file-viewer/types";
import { Tables } from "@packages/supabase";
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



export const FolderFileViewer = ({ folder, ...props }: Omit<FileViewerProps, "items"> & {
  folder: Folder
}) => {

  const [ loading, setLoading ] = useState<boolean>(true);
  const [ items, _setItems ] = useState<{
    files: readonly (Tables<"files"> & {
      versions: readonly {
        mime_type: string;
        number: number;
      }[];
    })[];
    folders: readonly Tables<"folders">[];
  } | null | undefined>();
  const setItems = useDebouncedCallback((_items: typeof items) => {
    _setItems(_items);
    setLoading(false);
  }, 500);
  const getItems = async () => {
    setLoading(true);
    const folders = await supabase()
      .from("folders")
      .select()
      .eq("folder_id", folder.id);
    const files = await supabase()
      .from("files")
      .select("*, versions:files_versions!inner(number, mime_type)")
      .eq("folder_id", folder.id);
    if (folders.error || files.error) {
      if (folders.error) toast.error("Unable to Load Folders!", {
        description: folders.error.message,
      });
      if (files.error) toast.error("Unable to Load Files!", {
        description: files.error.message,
      });
      setItems(null);
    } else setItems({
      folders: folders.data,
      files: files.data,
    });
  };

  useEffect(() => {(async () => await getItems())();}, []);
  useEventListener(CreateFolderDialog.RefreshEvent, getItems);
  useEventListener(FileViewerPrimitive.RefreshEvent, getItems);

  return (
    <div className="flex flex-col flex-1 h-full">
      <Card className="relative h-full p-0 flex flex-col flex-1 min-h-0 overflow-hidden gap-0">
        {items !== undefined && loading && (
          <div className="z-50 absolute inset-0 backdrop-blur-[2px] bg-background/20" />
        )}
        {items === undefined ? (
          <FileViewerSkeleton />
        ) : items === null ? (
          <div className={"flex flex-col items-center justify-center w-full h-full m-4 gap-2 bg-red-950"}>
            <AlertCircleIcon className={"text-destructive"} />
            <p className={"font-semibold text-destructive"}>{"Unable to Load Folder's Contents!"}</p>
            <p>{"An unexpected error occurred while trying to load this folder's contents."}</p>
            <Button className={"px-8 mt-8"} onClick={getItems}>
              {"Retry"}
            </Button>
          </div>
        ) : (
          <FileViewerPrimitive
            {...props}
            items={[
              ...items.folders.map(folder => ({
                type: "FOLDER" as const,
                id: folder.id,
                created_at: folder.created_at,
                name: folder.name,
                organization_id: props.organizationID,
                path: `/organizations/${props.organizationID}/folders/${folder.id}`,
              })),
              ...items.files.map(file => ({
                type: "FILE" as const,
                id: file.id,
                created_at: file.created_at,
                name: file.name,
                number: file.number,
                organization_id: props.organizationID,
                path: `/organizations/${props.organizationID}/files/${file.id}`,
                parent: {
                  id: file.folder_id
                },
                mime_type: file.versions.reduce((p, c) => p && c.number > p.number ? c : p, ({ number: -1, mime_type: "unknown" }) as ({ number: number; mime_type: string })).mime_type
              })),
            ]}
          />
        )}
      </Card>
    </div>
  );
};