import { FileViewerProps, Viewable } from "@apps/web/components/file-viewer/types";
import { useState } from "react";
import { flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { FileViewerColumns } from "@apps/web/components/file-viewer/columns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { ScrollArea, ScrollBar } from "@packages/ui/components/scroll-area";
import { Separator } from "@packages/ui/components/separator";



export const FileViewerPrimitive = (props: FileViewerProps) => {
  const [ sorting, setSorting ] = useState<SortingState>([]);


  const table = useReactTable({
    data: props.items as Viewable[],
    columns: FileViewerColumns,
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