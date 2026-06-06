import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@packages/ui/components/dropdown-menu";
import { Button, buttonVariants } from "@packages/ui/components/button";
import { EllipsisVerticalIcon } from "lucide-react";
import { RenameDialog } from "@apps/web/components/file-viewer/components/rename-dialog";
import { FileViewable } from "@apps/web/components/file-viewer/types";
import * as React from "react";
import { ComponentProps, MouseEventHandler, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProjDocsAPIClient } from "@apps/web/lib/api/with-ui";
import type { VariantProps } from "class-variance-authority";



const onClick: MouseEventHandler<HTMLButtonElement | HTMLDivElement> = (e) => {
  e.stopPropagation();
  e.preventDefault();
};

export const FileOptionsDropdown = (props: {
  viewable: FileViewable;
  apiURL: string;
  organizationID: string;
  trigger?: ComponentProps<"button"> & VariantProps<typeof buttonVariants>
}) => {

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <DropdownMenu>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          e.target.value = "";
          await ProjDocsAPIClient.from(props.apiURL).uploadVersion(file, {
            file: {
              id: props.viewable.id,
              folder_id: props.viewable.parent.id
            },
            organization: { id: props.organizationID },
          });
        }
        }
      />
      <DropdownMenuTrigger asChild onClick={onClick}>
        <Button variant={"outline"} size={"icon"} {...props.trigger}>
          <EllipsisVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="start">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{"File"}</DropdownMenuLabel>
          <RenameDialog viewable={props.viewable}>
            <DropdownMenuItem onClick={onClick}>
              {"Rename"}
            </DropdownMenuItem>
          </RenameDialog>
          <DropdownMenuItem onClick={onClick}>
            {"Delete"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>{"Version Control"}</DropdownMenuLabel>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger onClick={onClick}>{"Current Version"}</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={onClick}>Email</DropdownMenuItem>
                <DropdownMenuItem onClick={onClick}>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onClick}>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem onClick={(e) => {
            onClick(e);
            inputRef.current?.click();
          }}>
            {"New Version"}
          </DropdownMenuItem>

        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};