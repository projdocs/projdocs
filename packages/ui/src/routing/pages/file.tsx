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
import { ButtonGroup } from "@packages/ui/components/button-group";
import { DateTime } from "luxon";
import { FileOptionsDropdown } from "@packages/ui/components/file-browser/components/file-options-dropdown";
import { FileIcon } from "@untitledui/file-icons";
import { useTheme } from "next-themes";
import { Button } from "@packages/ui/components/button";
import { DownloadIcon } from "lucide-react";
import { Separator } from "@packages/ui/components/separator";
import { Badge } from "@packages/ui/components/badge";
import { useLibraryRouter } from "@packages/ui/routing";
import { ProjDocsAPIClient } from "@packages/shared/utilities/api/with-ui";
import { useLibrarySupabase } from "@packages/ui/lib/supabase-adapter";
import { FilePreview } from "@packages/ui/components/file-preview";


export type FilePageProps = {
  file: Tables<"files">;
  version: Tables<"files_versions">;
  versions: readonly Tables<"files_versions">[];
  can: {
    edit: boolean;
    delete: boolean;
  }
  organizationID: string;
  apiURL: string;
}

export function FilePage(props: FilePageProps) {

  const router = useLibraryRouter();
  const supabase = useLibrarySupabase();
  const { resolvedTheme } = useTheme();

  return (
    <div className={"w-full h-full overflow-hidden"}>

      <div className="p-8 flex flex-col w-full lg:min-h-0 h-full gap-2 overflow-y-scroll [&>*]:shrink-0">
        <Card className={"w-full p-0 gap-0 h-full max-h-full overflow-y-scroll"}>
          <CardHeader className={"p-2 md:p-4 gap-2 flex flex-row items-center justify-between"}>

            <div className={"flex flex-row gap-4 items-center max-w-full"}>
              <FileIcon
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                variant={"solid"}
                type={props.version.mime_type}
              />

              <H4 className={"max-w-full min-w-0 block truncate text-start"}>
                {props.file.name}
              </H4>

              { props.versions.at(0)?.id !== props.version.id && (
                <Badge variant={"destructive"}>
                  {"Viewing Outdated Version"}
                </Badge>
              ) }
            </div>


            <ButtonGroup>

              <Select
                value={props.version.id}
                onValueChange={(versionID) => router.navigate(`?version-id=${versionID}`)}
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

              <Button
                variant={"outline"}
                onClick={async () => await ProjDocsAPIClient.from(supabase, props.apiURL).download(
                  { id: props.organizationID },
                  props.file,
                  props.version,
                )}
              >
                <DownloadIcon />
              </Button>

              <FileOptionsDropdown
                viewable={{
                  type: "FILE",
                  id: props.file.id,
                  number: props.file.number,
                  name: props.file.name,
                  created_at: props.file.created_at,
                  organization_id: props.organizationID,
                  path: `/organizations/${props.organizationID}/files/${props.file.id}`,
                  parent: { id: props.file.folder_id },
                  mime_type: props.version.mime_type,
                }}
                organizationID={props.organizationID}
              />
            </ButtonGroup>
          </CardHeader>

          <Separator />

          <FilePreview
            apiURL={props.apiURL}
            version={props.version}
            file={props.file}
            organization={{
              id: props.organizationID,
            }}
          />
        </Card>
      </div>

    </div>
  );

}