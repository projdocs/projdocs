import "client-only";
import { FilePreviewProps } from "@apps/web/components/file-preview/types";
import { H2 } from "@packages/ui/components/typography";
import { Skeleton } from "@packages/ui/components/skeleton";
import { useEffect, useState } from "react";



const BYTES_PER_MB = 1000000; // not MiB

const SUPPORTED_TYPES = [
  "image/png",
]


export const FilePreview = (props: FilePreviewProps) => {

  const [ file, setFile ] = useState<unknown>(null);
  const isTooLarge = (props.version.size / BYTES_PER_MB) > 5;
  useEffect(() => {
    if(isTooLarge) {
      setFile(null);
      return;
    }


  }, []);

  if (isTooLarge) return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center text-center lg:w-1/2">
        <H2>{"File Too Large!"}</H2>
        <p
          className={"text-muted-foreground"}>{`It looks like this file is too large to preview in the browser (${(props.version.size / BYTES_PER_MB).toFixed(1)} mb). You can still download the file to view its contents.`}</p>
      </div>
    </div>
  );

  if (!SUPPORTED_TYPES.includes(props.version.mime_type)) return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center text-center lg:w-1/2">
        <H2>{"Preview Unavailable"}</H2>
        <p
          className={"text-muted-foreground"}>{`ProjDocs is unable to preview this file-type in the browser (${props.version.mime_type}). You can still download the file to view its contents.`}</p>
      </div>
    </div>
  );

  // loading state
  if (file === null || file === undefined) return (
    <Skeleton className={"w-full h-full"} />
  );

  switch (props.version.mime_type) {
    case "image/png":

  }

  return (
    <div className={""}>
    </div>
  );

};