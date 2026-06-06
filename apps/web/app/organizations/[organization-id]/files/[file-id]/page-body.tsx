"use client";

import { Tables } from "@packages/supabase";
import { Card, CardHeader } from "@packages/ui/components/card";
import { H4 } from "@packages/ui/components/typography";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@packages/ui/components/select";
import { useRouter } from "next/navigation";
import { cn } from "@packages/ui/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@packages/ui/components/tooltip";
import { ButtonGroup } from "@packages/ui/components/button-group";
import { DateTime } from "luxon";
import { FileOptionsDropdown } from "@apps/web/components/file-viewer/components/file-options-dropdown";
import { FileIcon } from "@untitledui/file-icons";
import { useTheme } from "next-themes";



export default function(props: {
  file: Tables<"files">;
  version: Tables<"files_versions">;
  versions: readonly Tables<"files_versions">[];
  can: {
    edit: boolean;
    delete: boolean;
  }
  organizationID: string;
  apiURL: string;
}) {

  const router = useRouter();
  const { resolvedTheme } = useTheme();

  return (
    <div className={"w-full h-full overflow-hidden"}>

      <div className="flex flex-col-reverse gap-8 lg:flex-row w-full lg:h-full">

        <div className="flex flex-col w-full lg:w-2/3 lg:min-h-0 h-full gap-2 overflow-y-scroll [&>*]:shrink-0">

        </div>

        <div className={"flex flex-col w-full lg:w-1/3 lg:h-full lg:min-h-0 p-4"}>
          <Card className={"lg:h-full w-full"}>

            <CardHeader className={"gap-4 flex flex-row items-center justify-between"}>

              <Tooltip>

                <FileIcon
                  theme={resolvedTheme === "dark" ? "dark" : "light"}
                  variant={"solid"}
                  type={props.version.mime_type}
                />

                <TooltipTrigger disabled={!props.can.edit} className="w-full min-w-0 overflow-hidden">
                  <H4
                    className={cn(
                      "w-full min-w-0 block truncate text-start",
                      props.can.edit ? "cursor-pointer hover:[text-shadow:0_0_12px_rgba(99,102,241,0.9)] transition-all duration-300" : "",
                    )}
                    onClick={() => props.can.edit && alert("FOO")}
                  >
                    {props.file.name}
                  </H4>
                </TooltipTrigger>
                <TooltipContent side={"bottom"}>
                  {"Change Name"}
                </TooltipContent>
              </Tooltip>

              <ButtonGroup>

                <Select
                  value={props.version.id}
                  onValueChange={(versionID) => router.push(`?version-id=${versionID}`)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a version">
                      {props.version ? `v${props.version.number}` : "Select a version"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{"Versions"}</SelectLabel>
                      {props.versions.map((version) => (
                        <SelectItem
                          key={version.id}
                          value={version.id}
                        >
                          <div className="flex flex-row w-30 items-center gap-2">

                            <FileIcon
                              theme={resolvedTheme === "dark" ? "dark" : "light"}
                              variant={"solid"}
                              type={version.mime_type}
                            />

                            <div className={"flex flex-col"}>
                              <p className={"line-clamp-1 truncate"}>{`Version ${version.number}`}</p>
                              <p className={"text-muted-foreground line-clamp-1 truncate"}>
                                {DateTime.fromISO(version.created_at).toRelative()}
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}

                    </SelectGroup>
                  </SelectContent>
                </Select>

                <FileOptionsDropdown
                  viewable={{
                    type: "FILE",
                    id: props.file.id,
                    number: props.file.number,
                    name: props.file.name,
                    created_at: props.file.created_at,
                    organization_id: props.organizationID,
                    path: `/organizations/${props.organizationID}/files/${props.file.id}`,
                    parent: {id: props.file.folder_id}
                  }}
                  apiURL={props.apiURL}
                  organizationID={props.organizationID}
                />
              </ButtonGroup>


            </CardHeader>

          </Card>
        </div>

      </div>

    </div>
  );

}