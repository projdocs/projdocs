import { Viewer } from "@packages/ui/components/file-preview/types";

import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { toast } from "sonner";
import { Skeleton } from "@packages/ui/components/file-preview/viewers/skeleton";
import { PDFJS, usePDFJS } from "@packages/ui/hooks/use-pdfjs";



async function pdfToImages(pdfjsLib: PDFJS, blob: Blob, scale = 1.5): Promise<string[]> {
  const buffer = await blob.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const outputScale = window.devicePixelRatio || 1;
  const urls: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    const transform = outputScale !== 1
      ? [ outputScale, 0, 0, outputScale, 0, 0 ]
      : null;

    await page.render({
      canvasContext: context,
      // @ts-expect-error
      transform,
      viewport,
    }).promise;

    urls.push(canvas.toDataURL("image/png"));
  }

  return urls;
}


export const PDF: Viewer = ({ blob }) => {

  const [ pages, _setPages ] = useState<string[] | null>(null);
  const setPages = useDebouncedCallback(_setPages, 100);

  usePDFJS(async (pdfjs) => await pdfToImages(pdfjs, blob)
    .then(setPages)
    .catch((err) => {
      console.error("Failed to render PDF:", err);
      toast.error("Failed to render PDF!");
    }), [ blob as any ]);

  if (pages === null) return (
    <Skeleton blob={null as any} />
  );

  return (
    <div className={"flex flex-row max-h-full overflow-hidden"}>
      <div className={"w-full overflow-y-scroll p-2 md:p-8"}>
        <div className="flex flex-col gap-4">
          {pages.map((src, i) => (
            <img alt={""} key={i} src={src} className="max-w-full object-contain" />
          ))}
        </div>
      </div>
    </div>
  );

};

PDF.isSupported = (mimeType) => mimeType === "application/pdf";