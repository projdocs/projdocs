"use client";

import { Card } from "@packages/ui/components/card";
import { ScrollArea, ScrollBar } from "@packages/ui/components/scroll-area";
import { Button } from "@packages/ui/components/button";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { AlertCircleIcon, ArrowDown, ArrowUp, ArrowUpDown, File, Folder } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Tables } from "@packages/supabase";
import { supabase } from "@apps/web/lib/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@packages/ui/components/skeleton";
import { cn } from "@packages/ui/lib/utils";
import { useDebouncedCallback } from "use-debounce";
import { useEventListener } from "@packages/ui/hooks/use-event-listener";
import { CreateFolderDialog } from "@apps/web/components/create-folder-dialog";
import { useRouter } from "next/navigation";
import { Separator } from "@packages/ui/components/separator";



export type FileView = {
  id: string;
  type: "FILE";
  name: string;
  number: number;
  version: number;
  created_at: string;
  organization_id: string;
};

export type FolderView = {
  id: string;
  type: "FOLDER";
  name: string;
  created_at: string;
  organization_id: string;
};

export type Viewable = FileView | FolderView;

export type FileViewerProps = {
  items: ReadonlyArray<Viewable>;
  organizationID: string;
};

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted) return <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/50" />;
  if (sorted === "asc") return <ArrowUp className="ml-2 h-3.5 w-3.5" />;
  return <ArrowDown className="ml-2 h-3.5 w-3.5" />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const FolderRow = ({ row }: {
  row: {
    original: Viewable;
  }
}) => {
  const router = useRouter();
  return (
    <div
      className={`flex items-center gap-2.5 ${row.original.type === "FOLDER" ? "cursor-pointer group" : ""}`}
      onClick={() => {
        switch (row.original.type) {
          case "FOLDER":
            router.push(`/organizations/${row.original.organization_id}/folders/${row.original.id}`);
        }
      }}
    >
      {row.original.type === "FOLDER" && (
        <Folder className="h-4 w-4 shrink-0 text-amber-500" />
      )}
      {row.original.type === "FILE" && (
        <File className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <span
        className={`text-sm truncate ${row.original.type === "FOLDER" ? "group-hover:underline underline-offset-4" : ""}`}
      >
        {row.original.name}
      </span>
    </div>
  );
};

const column = createColumnHelper<Viewable>();
const columns = [
  column.accessor("name", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <SortIcon sorted={column.getIsSorted()} />
      </Button>
    ),
    cell: FolderRow,
    sortingFn: "foldersFirst",
  }),
  column.accessor("created_at", {
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 font-medium"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created
        <SortIcon sorted={column.getIsSorted()} />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">
          {formatDate(row.original.created_at)}
        </span>
    ),
    sortingFn: "foldersFirst",
  }),
];

export const FileViewer = (props: FileViewerProps) => {
  const [ sorting, setSorting ] = useState<SortingState>([]);


  const table = useReactTable({
    data: props.items as Viewable[],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    sortingFns: {
      foldersFirst: (a, b, columnId) => {
        const aIsFolder = a.original.type === "FOLDER";
        const bIsFolder = b.original.type === "FOLDER";
        if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1; // always folders first, direction ignored
        // within the same group, fall through to natural comparison (TanStack applies direction to this)
        const aVal = a.getValue<string>(columnId);
        const bVal = b.getValue<string>(columnId);
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      },
    },
  });

  return (
    <>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          {table.getHeaderGroups().map(hg => (
            <TableRow key={hg.id}>
              {hg.headers.map(header => (
                <TableHead key={header.id} className={header.id === "created_at" ? "w-40" : ""}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
      </Table>

      {table.getRowModel().rows.length === 0 ? (
        <div className={"flex-1 min-h-0 justify-center items-center flex flex-col m-8"}>
          <p className={"text-muted-foreground text-center"}>{"This space is empty!"}</p>
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <Table>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className={cell.column.id === "created_at" ? "w-40" : ""}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
              }
            </TableBody>
          </Table>
          <Separator />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      )}
    </>
  );
};

FileViewer.Skeleton = () => {

  const skeletonWidths = useMemo(() => Array.from({ length: 10 }, () => columns.map(() => Math.floor(Math.random() * 40 + 40))), []);

  return (
    <>
      <Table className={"w-full h-full"}>
        <TableHeader>
          <TableRow>
            {columns.map((col, index, arr) => (
              <TableHead key={index}>
                <Skeleton className={cn("h-4")} style={{ width: `${((index + 1) / (arr.length + 1)) * 100}%` }} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {skeletonWidths.map((row, i) => (
            <TableRow key={i}>
              {row.map((width, j) => (
                <TableCell key={j}>
                  <Skeleton suppressHydrationWarning className="h-4" style={{ width: `${width}%` }} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Separator />
    </>
  );
};

export type Folder = Tables<"folders"> & {
  client: Tables<"clients"> | null;
  project: Tables<"projects"> | null;
  organization: Tables<"organizations"> | null;
  member: Tables<"members"> | null;
  folder: Tables<"folders"> | null;
}

FileViewer.Folder = ({ folder, ...props }: Omit<FileViewerProps, "items"> & {
  folder: Folder
}) => {

  const [ loading, setLoading ] = useState<boolean>(true);
  const [ items, _setItems ] = useState<{
    files: readonly Tables<"files">[];
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
      .select()
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

  return (
    <div className="flex flex-col flex-1 h-full">
      <Card className="relative h-full p-0 flex flex-col flex-1 min-h-0 overflow-hidden gap-0">
        {items !== undefined && loading && (
          <div className="z-50 absolute inset-0 backdrop-blur-[2px] bg-background/20" />
        )}
        {items === undefined ? (
          <FileViewer.Skeleton />
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
          <FileViewer
            {...props}
            items={[
              ...items.folders.map(folder => ({
                type: "FOLDER" as const,
                id: folder.id,
                created_at: folder.created_at,
                name: folder.name,
                organization_id: props.organizationID,
              })),
              ...items.files.map(file => ({
                type: "FILE" as const,
                id: file.id,
                created_at: file.created_at,
                name: "TODO",
                number: file.number,
                version: -1,
                organization_id: props.organizationID,
              })),
            ]}
          />
        )}
      </Card>
    </div>
  );
};

FileViewer.Project = ({ project, ...props }: Omit<FileViewerProps, "items" | "organizationID"> & {
  project: Tables<"projects">
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
      .select()
      .eq("project_id", project.id)
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

  return (
    <div className="flex flex-col flex-1 h-full">
      <Card className="relative h-full p-0 flex flex-col flex-1 min-h-0 overflow-hidden gap-0">
        {folders !== undefined && loading && (
          <div className="z-50 absolute inset-0 backdrop-blur-[2px] bg-background/20" />
        )}
        {folders === undefined ? (
          <FileViewer.Skeleton />
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
          <FileViewer
            {...props}
            organizationID={project.organization_id}
            items={folders.map(folder => ({
              type: "FOLDER",
              id: folder.id,
              created_at: folder.created_at,
              name: folder.name,
              organization_id: project.organization_id,
            }))}
          />
        )}
      </Card>
    </div>
  );
};