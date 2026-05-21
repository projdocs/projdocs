import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@packages/ui/components/table";
import { FileViewerColumns } from "@apps/web/components/file-viewer/columns";
import { Skeleton } from "@packages/ui/components/skeleton";
import { Separator } from "@packages/ui/components/separator";
import { cn } from "@packages/ui/lib/utils";



export const FileViewerSkeleton = () => {

  const skeletonWidths = useMemo(() => Array.from({ length: 10 }, () => FileViewerColumns.map(() => Math.floor(Math.random() * 40 + 40))), []);

  return (
    <>
      <Table className={"w-full h-full"}>
        <TableHeader>
          <TableRow>
            {FileViewerColumns.map((col, index, arr) => (
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