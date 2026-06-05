"use client";

import { ObjectPage } from "@packages/ui/components/page";
import { ChevronDownIcon, FilePlusIcon, FolderIcon } from "lucide-react";
import { H1 } from "@packages/ui/components/typography";
import { Avatar, AvatarFallback } from "@packages/ui/components/avatar";
import { useRouter } from "next/navigation";
import { ButtonGroup } from "@packages/ui/components/button-group";
import { Button } from "@packages/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import { CreateFolderDialog } from "@apps/web/components/create-folder-dialog";
import { Badge } from "@packages/ui/components/badge";
import { ChangeEvent, ReactNode, useRef } from "react";
import { cn } from "@packages/ui/lib/utils";
import { FileViewer } from "@apps/web/components/file-viewer";
import { Folder } from "@apps/web/components/file-viewer/types";
import { toast } from "sonner";
import { supabase } from "@apps/web/lib/supabase/client";
import * as tus from "tus-js-client";
import { Progress } from "@packages/ui/components/progress";
import { v4 } from "uuid";
import { useEventListener } from "@packages/ui/hooks/use-event-listener";
import { FolderFileViewer } from "@apps/web/components/file-viewer/viewer-folder";
import { FileViewerPrimitive } from "@apps/web/components/file-viewer/primitive";
import { DetailedError } from "tus-js-client";



const ParentBadge = ({ title, icon, path, className }: {
  title: string;
  icon: ReactNode;
  path: string;
  className?: string;
}) => {
  const router = useRouter();
  return (
    <Badge onClick={() => router.push(path)} className={cn("h-8 px-4 hover:bg-accent cursor-pointer", className)}
           variant={"outline"}>
      <div className={"flex flex-row gap-2 items-center max-w-full"}>
        {icon}
        <p className={"truncate line-clamp-1 text-muted-foreground"}>
          {title}
        </p>
      </div>
    </Badge>
  );
};

export const FolderPageBody = (props: {
  folder: Folder;
  organizationID: string;
  apiURL: string;
}) => {

  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      const session = await supabase().auth.getSession();
      if (session.error) throw new Error(`Authentication error: ${session.error.message}`);

      const token = session.data.session?.access_token;
      if (!token) throw new Error("No active session—please sign in again.");

      const fileID = await new Promise<string | undefined>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: `${props.apiURL}/v1/organizations/${props.organizationID}/folders/${props.folder.id}/upload`,
          retryDelays: [ 0, 1000, 3000, 5000 ],
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          onError(error) {
            reject(error);
          },
          onProgress(bytesUploaded, bytesTotal) {
            const percent = Math.floor((bytesUploaded / bytesTotal) * 100);
            toast.loading(
              <div className="flex flex-col gap-1 w-full min-w-[200px]">
                <span className="text-sm">{file.name}</span>
                <Progress value={percent} className="w-full" />
                <span className="text-xs text-muted-foreground">{percent}%</span>
              </div>,
              { id: toastId },
            );
          },
          onSuccess: (result) => resolve(result.lastResponse.getHeader("Location")),
        });

        // // 2026.05.31 / causing bugs in post-processing
        // upload.findPreviousUploads().then((previous) => {
        //   if (previous.length > 0 && previous[0] !== undefined) {
        //     upload.resumeFromPreviousUpload(previous[0]);
        //   }
        //   upload.start();
        // }).catch(reject);

        upload.start();
      });

      // complete the file upload
      useEventListener.RemoteDispatch(FileViewerPrimitive.RefreshEvent, () => {});
      toast.success(`${file.name} uploaded successfully`, {
        action: {
          label: "View",
          onClick: () => {
            router.push(`/organizations/${props.organizationID}/files/${fileID?.split(":").at(0)}`);
            toast.dismiss(toastId);
          },
        },
        id: toastId
      });
    } catch (error) {
      let message = error instanceof Error ? error.message : "Unknown error occurred";

      // try to parse an API error
      if (error instanceof DetailedError) {
        try {
          const body = error.originalResponse?.getBody();
          if (body) {
            const result = JSON.parse(body);
            if (typeof result.error === "string") message = result.error;
          }
        } catch {}
      }

      toast.error(`Failed to upload!`, { description: message, id: toastId });
    } finally {
      setTimeout(() => toast.dismiss(toastId), 3000);
    }
  };


  return (
    <ObjectPage
      title={(
        <div className={"flex flex-row gap-4 items-center max-w-full"}>
          <FolderIcon className="h-8 w-8 shrink-0 text-amber-500" />
          <H1 className={"truncate line-clamp-1"}>{props.folder.name}</H1>
        </div>
      )}
      description={(
        <div className={"flex flex-row gap-2 py-2 items-center max-w-full"}>
          <p className={"text-muted-foreground"}>{"located in"}</p>
          {props.folder.member && (
            <ParentBadge
              title={"My Files"}
              icon={<></>}
              path={`/organizations/${props.organizationID}`}
            />
          )}
          {props.folder.folder && (
            <ParentBadge
              title={props.folder.folder.name}
              icon={(<FolderIcon className="h-4 w-4 shrink-0 text-amber-500" />)}
              path={`/organizations/${props.organizationID}/folders/${props.folder.folder!.id}`}
            />
          )}
          {props.folder.client && (
            <ParentBadge
              className={"pl-1"}
              title={props.folder.client.name.trim()}
              path={`/organizations/${props.folder.client.organization_id}/clients/${props.folder.client.id}`}
              icon={(
                <Avatar size={"sm"}>
                  <AvatarFallback>{props.folder.client.name.trim().at(0)}</AvatarFallback>
                </Avatar>
              )}
            />
          )}
          {props.folder.project && (
            <ParentBadge
              className={"pl-1"}
              title={props.folder.project.display}
              path={`/organizations/${props.folder.project.organization_id}/projects/${props.folder.project.id}`}
              icon={(
                <Avatar size={"sm"}>
                  <AvatarFallback>{props.folder.project.display.trim().at(0)}</AvatarFallback>
                </Avatar>
              )}
            />
          )}
        </div>
      )}
      action={(
        <>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <ButtonGroup>
            <CreateFolderDialog forOrganizationId={props.organizationID} apiURL={props.apiURL} folder_id={props.folder.id} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More Options">
                  <ChevronDownIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={(e) => inputRef.current?.click()}>
                    <FilePlusIcon />
                    {"Upload File"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </>
      )}
    >
      <FileViewer.Folder
        folder={props.folder}
        organizationID={props.organizationID}
        onRowClick={({path}) => router.push(path)}
        onRowDoubleClick={({path}) => router.push(path)}
      />
    </ObjectPage>
  );
};