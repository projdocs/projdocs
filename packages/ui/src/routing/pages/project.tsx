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



export type SearchResult = Database["public"]["Functions"]["search_table"]["Returns"][number];
export type Project = Tables<"projects"> & {
  links: ReadonlyArray<Tables<"clients_projects"> & {
    client: Tables<"clients">;
  }>
}

function ClientCombobox(props: {
  project: Project;
  setProject: Dispatch<SetStateAction<Project>>;
}) {
  const anchor = useComboboxAnchor();
  const supabase = useLibrarySupabase();
  const [ loading, setLoading ] = useState<boolean>(false);

  const [ searchLoading, setSearchLoading ] = useState<boolean>(false);
  const [ searchValue, setSearchValue ] = useState<string>("");
  const [ searchResults, setSearchResults ] = useState<readonly SearchResult[]>([]);

  const debounce = useDebouncedCallback<(query: string) => unknown>((query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
    } else supabase.rpc("search_table", {
      _table: "CLIENTS",
      _query: query.trim(),
      _organization_id: props.project.organization_id
    }).then(({ data, error }) => {
      if (error) {
        console.error(error);
        toast.error("Unable to Search Clients!", {
          description: error.message,
        });
      } else setSearchResults(data);
      setSearchLoading(false);
    });
  }, 500);

  return (
    <Combobox
      multiple
      autoHighlight
      items={searchResults}
      value={props.project.links.map(link => ({
        id: link.client.id,
        display: link.client.name,
        number: link.client.number,
        rank: -1,
      }))}
      onValueChange={async (clients) => {
        setLoading(true);

        const addClients = clients.filter(client => !props.project.links.find(link => link.client_id === client.id));
        const removeClients = props.project.links.filter(link => !clients.find(client => link.client_id === client.id));

        if (addClients.length > 0) await supabase.from("clients_projects").insert(addClients.map(client => ({
          client_id: client.id,
          project_id: props.project.id,
          organization_id: props.project.organization_id,
        })));

        if (removeClients.length > 0) await supabase.from("clients_projects").delete().in("id", removeClients.map(c => c.id));

        getProject(supabase, {
          projectID: props.project.id,
          organizationID: props.project.organization_id,
        }).then(({ data, error }) => {
          if (error) {
            console.error(error);
            toast.error("Unable to Update Client-Access!", {
              description: error.message,
            });
          } else props.setProject(data);
          setLoading(false);
        });
      }}
      disabled={loading}
      inputValue={searchValue}
      onInputValueChange={(v) => {
        setSearchValue(v);
        setSearchLoading(true);
        debounce(v);
      }}
    >
      <ComboboxChips ref={anchor} className="flex-wrap overflow-hidden max-w-full">
        <ComboboxValue>
          {(values: readonly SearchResult[]) => (
            <Fragment>
              {values.map((value) => (
                <ComboboxChip key={value.id} className="min-w-0 max-w-full">
                  <span className="truncate block">{value.display}</span>
                </ComboboxChip>
              ))}
              <ComboboxChipsInput className={"w-full min-w-full text-center mt-2"} placeholder={"Select clients..."} />
            </Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent className="max-w-full" anchor={anchor}>
        <ComboboxEmpty>
          {searchLoading ? <Spinner /> : !searchValue.trim() ? "Enter a search term..." : "No clients found!"}
        </ComboboxEmpty>
        <ComboboxList className="max-w-full">
          {(item: SearchResult) => (
            <ComboboxItem className="max-w-full" key={item.id} value={item}>
              <Item size="xs" className="p-0">
                <ItemContent>
                  <ItemTitle className="truncate">{item.display}</ItemTitle>
                  <ItemDescription className="truncate">{item.id}</ItemDescription>
                </ItemContent>
              </Item>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
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
              <ClientCombobox
                project={project}
                setProject={setProject}
              />

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