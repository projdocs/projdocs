"use client";

import { useLibraryRouter } from "@packages/ui/routing";
import { Dispatch, Fragment, SetStateAction, useState } from "react";
import { ObjectPage } from "@packages/ui/components/page";
import { ClickToCopyID } from "@packages/ui/components/id-value";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { Separator } from "@packages/ui/components/separator";
import { CreateFolderDialog } from "@packages/ui/components/dialogs/create-folder-dialog";
import { FileBrowser } from "@packages/ui/components/file-browser";
import { Database, Tables } from "@packages/supabase";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@packages/ui/components/combobox";
import { useDebouncedCallback } from "use-debounce";
import { useLibrarySupabase } from "@packages/ui/lib/supabase-adapter";
import { toast } from "sonner";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@packages/ui/components/item";
import { Spinner } from "@packages/ui/components/spinner";
import { getProject } from "@packages/ui/routing/pages/project-utils";



export type Project = Tables<"projects"> & {
  client: Tables<"clients">;
}

export type ProjectPageProps = {
  project: Project;
  apiURL: string;
};

export function ProjectPage(props: ProjectPageProps) {
  const router = useLibraryRouter();
  const [ project, setProject ] = useState<Project>({ ...props.project });

  return (
    <ObjectPage
      title={project.display}
      description={(
        <ClickToCopyID>
          {project.id}
        </ClickToCopyID>
      )}
    >
      <div className="flex flex-col-reverse gap-8 lg:flex-row w-full lg:h-full max-h-full">
        <div className="flex flex-col w-full lg:w-2/3 lg:h-full gap-2">
          <FileBrowser.Project
            apiURL={props.apiURL}
            project={props.project}
            onRowClick={({ path }) => router.navigate(path)}
            onRowDoubleClick={({ path }) => router.navigate(path)}
          />
        </div>
        <div className={"flex flex-col w-full lg:w-1/3 lg:h-full gap-4"}>
          <Card className={"min-h-0 flex-1"}>
            <CardHeader>
              <CardTitle>Access Settings</CardTitle>
              <CardDescription>
                Control which users and projects are associated with this project.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-auto justify-between flex flex-col gap-16">


              <div className={"flex flex-col gap-6"}>
                <Separator />

                <CreateFolderDialog
                  forOrganizationId={props.project.organization_id}
                  project_id={props.project.id}
                  apiURL={props.apiURL}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ObjectPage>
  );
}