import { FilePreviewProps, Viewer } from "@packages/ui/components/file-preview/types";
import { useEffect, useState } from "react";
import { PDF } from "@packages/ui/components/file-preview/viewers/pdf";
import { Skeleton } from "@packages/ui/components/file-preview/viewers/skeleton";
import { toast } from "sonner";
import { H2 } from "@packages/ui/components/typography";
import { useLibrarySupabase } from "@packages/ui/lib/supabase-adapter";



const DOCUMENT_MIME_TYPES = [
  // Microsoft Office
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // OpenDocument
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  // PDF
  "application/pdf",
  // Text
  "text/plain",
  "text/csv",
  "text/html",
  "text/markdown",
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
] as const;

export const SafeConvert: Viewer<FilePreviewProps> = (props) => {

  const supabase = useLibrarySupabase();
  const [ blob, setBlob ] = useState<Blob | null | undefined>(undefined);
  useEffect(() => {
    setBlob(undefined);
    supabase.auth.getSession().then(session => {
      if (session.data.session?.access_token) return session.data.session.access_token;
      else {
        throw "Unable to load authentication session!";
      }
    })
      .then(session => fetch(`${props.apiURL}/v1/organizations/${props.organization.id}/folders/${props.file.folder_id}/files/${props.file.id}/versions/${props.version.id}/preview`, {
        headers: {
          "Authorization": `Bearer ${session}`,
        },
      })
        .then(async (r) => {
          if (r.status !== 200) {
            const { error } = await r.json();
            throw error;
          }

          const { data } = await r.json();
          const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
          return new Blob([ bytes ], { type: "application/pdf" });
        }))

      .then(setBlob)
      .catch(e => {
        console.error(e);
        toast.error("Failed to generate preview!", {
          description: typeof e === "string" ? e : "Check the browser console for more details.",
        });
      });
  }, [ props.version.id, props.file.id, props.organization.id ]);

  if (blob === undefined) return (
    <Skeleton blob={null as any} />
  );

  if (blob === null) return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center text-center lg:w-1/2 p-4">
        <H2>{"Preview Generation Failed"}</H2>
        <p
          className={"text-muted-foreground"}>{`ProjDocs was unable to preview this file-type in the browser (${props.version.mime_type}). You can still download the file to view its contents.`}</p>
      </div>
    </div>
  );

  return (
    <PDF blob={blob} />
  );
};

SafeConvert.isSupported = (mimeType) => DOCUMENT_MIME_TYPES.includes(mimeType as any);