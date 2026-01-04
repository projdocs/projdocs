import {
  ColumnDef,
  ColumnSort,
  flexRender,
  getCoreRowModel,
  PaginationState,
  SortingState,
  TableOptions,
  useReactTable
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { cn } from "@workspace/ui/lib/utils";
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon, Loader2
} from "lucide-react";
import { Label } from "@workspace/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select";
import { Pagination, PaginationContent, PaginationItem } from "@workspace/ui/components/pagination";
import { Button } from "@workspace/ui/components/button";
import { useEffect, useId, useMemo, useState } from "react";
import { useEventListener } from "@workspace/web/hooks/use-event-listener";
import { useOnceler } from "@workspace/web/hooks/use-onceler";


type PaginatedDataTableState<TData> = {
  count: number;
  rows: TData[];
};

export function PaginatedDataTable<TData>(props: {
  columns: ColumnDef<TData>[];

  /* Custom event listener (on window) to listen for events to trigger refreshing the table's data */
  refreshEvent?: string;

  getData: (props: {
    pagination: PaginationState;
    abortSignal: AbortSignal;
    sort: ColumnSort | null;
  }) => Promise<PaginatedDataTableState<TData>>;
}) {
  const id = useId();

  const [state, setState] = useState<PaginatedDataTableState<TData>>({
    rows: [],
    count: 0,
  });

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  });

  const [sorting, setSorting] = useState<SortingState>(() => {
    const initialSortCol = props.columns
      .filter((c) => !!c.id && (typeof c.enableSorting === "undefined" || c.enableSorting))
      .at(0);

    const initialSortState: SortingState = initialSortCol
      ? [
        {
          id: initialSortCol.id!,
          desc: false,
        },
      ]
      : [];

    return initialSortState;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pageCount = useMemo(() => {
    if (pagination.pageSize <= 0) return 0;
    return Math.max(1, Math.ceil(state.count / pagination.pageSize));
  }, [state.count, pagination.pageSize]);

  const refresh = useOnceler<PaginatedDataTableState<TData>>(
    async (as) => {
      setIsLoading(true);
      try {
        return await props.getData({
          abortSignal: as,
          sort: sorting[0] ?? null,
          pagination,
        });
      } catch (error) {
        console.error(error);
        return { rows: [], count: 0 };
      } finally {
        // If you prefer “keep dim until state applied”, move this to the success callback only.
        setIsLoading(false);
      }
    },
    (next) => {
      setState(next);

      // If total count shrank and current page is now out of range, clamp it.
      const nextPageCount = Math.max(1, Math.ceil(next.count / pagination.pageSize));
      const maxIndex = nextPageCount - 1;
      if (pagination.pageIndex > maxIndex) {
        setPagination((p) => ({ ...p, pageIndex: maxIndex }));
      }
    }
  );

  // handle data fetching
  useEffect(refresh.do, [
    sorting[0]?.id,
    sorting[0]?.desc,
    pagination.pageSize,
    pagination.pageIndex,
  ]);

  useEventListener(props.refreshEvent ?? `PaginatedDataTable-EL-${id}`, refresh.do);

  const table = useReactTable({
    data: state.rows, // already paginated
    columns: props.columns,
    getCoreRowModel: getCoreRowModel(),

    manualSorting: true,
    manualPagination: true,
    pageCount,

    onSortingChange: setSorting,
    enableSortingRemoval: false,

    onPaginationChange: setPagination,

    state: {
      sorting,
      pagination,
    },
  });

  const canPreviousPage = table.getState().pagination.pageIndex > 0;
  const canNextPage = table.getState().pagination.pageIndex + 1 < pageCount;

  const startRow = useMemo(() => {
    if (state.count === 0) return 0;
    return pagination.pageIndex * pagination.pageSize + 1;
  }, [state.count, pagination.pageIndex, pagination.pageSize]);

  const endRow = useMemo(() => {
    if (state.count === 0) return 0;
    return Math.min((pagination.pageIndex + 1) * pagination.pageSize, state.count);
  }, [state.count, pagination.pageIndex, pagination.pageSize]);

  return (
    <div className="space-y-4 md:w-full" aria-busy={isLoading}>
      {/* Wrap EVERYTHING we want to dim/disable */}
      <div className="relative">
        <div
          className={cn(
            isLoading && "opacity-60 pointer-events-none select-none",
            "gap-2 flex flex-col"
          )}
        >
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();

                      return (
                        <TableHead
                          key={header.id}
                          style={{ width: `${header.getSize()}px` }}
                          className="h-11"
                        >
                          {header.isPlaceholder ? null : canSort ? (
                            <div
                              className={cn(
                                "flex h-full items-center gap-2 select-none",
                                isLoading ? "cursor-not-allowed" : "cursor-pointer"
                              )}
                              onClick={isLoading ? undefined : header.column.getToggleSortingHandler()}
                              onKeyDown={
                                isLoading
                                  ? undefined
                                  : (e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      header.column.getToggleSortingHandler()?.(e);
                                    }
                                  }
                              }
                              tabIndex={isLoading ? -1 : 0}
                              aria-disabled={isLoading}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}

                              {sorted === "asc" ? (
                                <ChevronUpIcon size={16} />
                              ) : sorted === "desc" ? (
                                <ChevronDownIcon size={16} />
                              ) : (
                                <ChevronsUpDownIcon size={16} />
                              )}
                            </div>
                          ) : (
                            flexRender(header.column.columnDef.header, header.getContext())
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={props.columns.length} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <Label htmlFor={id} className="max-sm:sr-only">
                Rows per page
              </Label>

              <Select
                disabled={isLoading}
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger id={id} className="w-fit whitespace-nowrap">
                  <SelectValue placeholder="Select number of results" />
                </SelectTrigger>
                <SelectContent className="[&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto">
                  {[5, 10, 25, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
              <p className="text-muted-foreground text-sm whitespace-nowrap" aria-live="polite">
                <span className="text-foreground">
                  {startRow}-{endRow}
                </span>{" "}
                of <span className="text-foreground">{state.count}</span>
              </p>
            </div>

            <div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => table.setPageIndex(0)}
                      disabled={isLoading || !canPreviousPage}
                      aria-label="Go to first page"
                    >
                      <ChevronFirstIcon aria-hidden="true" />
                    </Button>
                  </PaginationItem>

                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => table.previousPage()}
                      disabled={isLoading || !canPreviousPage}
                      aria-label="Go to previous page"
                    >
                      <ChevronLeftIcon aria-hidden="true" />
                    </Button>
                  </PaginationItem>

                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => table.nextPage()}
                      disabled={isLoading || !canNextPage}
                      aria-label="Go to next page"
                    >
                      <ChevronRightIcon aria-hidden="true" />
                    </Button>
                  </PaginationItem>

                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => table.setPageIndex(pageCount - 1)}
                      disabled={isLoading || !canNextPage}
                      aria-label="Go to last page"
                    >
                      <ChevronLastIcon aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>

        {/* Overlay goes OUTSIDE the disabled wrapper so it still shows/captures clicks */}
        {isLoading ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-background/60 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface DataTableProps<TData> {
  columns: TableOptions<TData>["columns"];
  data: TData[];
}

export function DataTable<TData>({
                                   columns,
                                   data,
                                 }: DataTableProps<TData>) {
  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader className="bg-muted sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}