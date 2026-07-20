import { createColumnHelper } from "@tanstack/react-table";
import { Button } from "@packages/ui/components/button";
import { Viewable } from "./types";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, FolderIcon } from "lucide-react";
import { FileOptionsDropdown } from "./components/file-options-dropdown";
import { FileIcon } from "@untitledui/file-icons";



function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted) return <ArrowUpDownIcon className="ml-2 h-3.5 w-3.5 text-muted-foreground/50" />;
  if (sorted === "asc") return <ArrowUpIcon className="ml-2 h-3.5 w-3.5" />;
  return <ArrowDownIcon className="ml-2 h-3.5 w-3.5" />;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const column = createColumnHelper<Viewable>();
export const FileViewerColumns = (orgID: string, theme: string) => [
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
    cell: ({ row }) => (
      <div className={"flex items-center gap-2.5"}>
        {row.original.type === "FOLDER" && (
          <FolderIcon className="h-9 w-9 shrink-0 text-amber-500" />
        )}
        {row.original.type === "FILE" && (
          <FileIcon
            className={"h-9 w-9 shrink-0"}
            theme={theme === "dark" ? "dark" : "light"}
            variant={"solid"}
            type={row.original.mime_type}
          />
        )}
        <span
          className={`text-sm truncate ${row.original.type === "FOLDER" ? "group-hover:underline underline-offset-4" : ""}`}
        >
          {row.original.name}
        </span>
      </div>
    ),
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
  }),
  column.accessor("id", {
    header: " ",
    size: 1,
    maxSize: 1,
    cell: ({ row: { original } }) => (
      <div className={"flex flex-row justify-end"}>
        {original.type === "FILE" && (
          <FileOptionsDropdown
            viewable={original}
            organizationID={orgID}
            trigger={{
              variant: "ghost",
            }}
          />
        )}
      </div>
    ),
  }),
];