import { useMemo } from "react";
import { Viewer } from "@packages/ui/components/file-preview/types";



const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/bmp",
  "image/ico",
  "image/x-icon",
] as const;


export const Image: Viewer = ({ blob }) => {
  const src = useMemo(() => URL.createObjectURL(blob), [ blob ]);
  return (
    <div className={"p-2 md:p-8 w-full h-full max-w-full max-h-full overflow-hidden"}>
      <img className={"object-contain w-full h-full"} src={src} alt={"Image Preview"} />
    </div>
  );
};

Image.isSupported = (mimeType) => IMAGE_MIME_TYPES.includes(mimeType as any);
