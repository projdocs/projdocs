import "client-only";
import { FilePreviewProps } from "@apps/web/components/file-preview/types";
import { H2 } from "@packages/ui/components/typography";
import { useEffect, useState } from "react";
import { ProjDocsAPI } from "@apps/web/lib/api";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import * as Viewers from "@apps/web/components/file-preview/viewers";



const BYTES_PER_MB = 1000000; // not MiB


export const FilePreview = (props: FilePreviewProps) => {

  const [ blob, _setBlob ] = useState<Blob | null>(null);
  const setBlob = useDebouncedCallback(_setBlob, 500);

  const isTooLarge = (props.version.size / BYTES_PER_MB) > 5;
  useEffect(() => {

    let mounted = true;
    setBlob(null);

    if (!isTooLarge) ProjDocsAPI.from(props.apiURL).download(
      props.organization,
      props.file,
      props.version,
    ).then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        toast.error("Unable to download preview!", {
          description: error,
        });
        setBlob(null);
        return;
      }
      setBlob(data);
    });

    return () => {
      mounted = false;
    };
  }, [ props.version.id ]);

  if (isTooLarge) return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center text-center lg:w-1/2 p-4">
        <H2>{"File Too Large!"}</H2>
        <p
          className={"text-muted-foreground"}>{`It looks like this file is too large to preview in the browser (${(props.version.size / BYTES_PER_MB).toFixed(1)} mb). You can still download the file to view its contents.`}</p>
      </div>
    </div>
  );

  // loading state
  if (blob === null) return (
    <Viewers.Skeleton
      blob={null as any} // not used
    />
  );

  // images
  if (Viewers.Image.isSupported(props.version.mime_type)) return (
    <Viewers.Image blob={blob} />
  );

  // pdfs
  if (Viewers.PDF.isSupported(props.version.mime_type)) return (
    <Viewers.PDF blob={blob} />
  );

  // catch-all
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center text-center lg:w-1/2 p-4">
        <H2>{"Preview Unavailable"}</H2>
        <p
          className={"text-muted-foreground"}>{`ProjDocs is unable to preview this file-type in the browser (${props.version.mime_type}). You can still download the file to view its contents.`}</p>
      </div>
    </div>
  );

};