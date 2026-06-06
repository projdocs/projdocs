import { supabase } from "@apps/web/lib/supabase/client";
import * as tus from "tus-js-client";
import { DetailedError } from "tus-js-client";
import { Tables } from "@packages/supabase";



export class ProjDocsAPI {

  private readonly origin: string;

  constructor(host: string) {
    this.origin = (new URL(host)).origin;
  }

  static from(host: string) {
    return new ProjDocsAPI(host);
  }

  private async __upload(path: string, file: File, onProgress?: (progressPercentInteger: number) => unknown) {

    try {
      const session = await supabase().auth.getSession();
      if (session.error) throw new Error(`Authentication error: ${session.error.message}`);

      const token = session.data.session?.access_token;
      if (!token) throw new Error("No active session—please sign in again.");

      const result = await new Promise<string | undefined>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: `${this.origin}/${path.startsWith("/") ? path.substring(1) : path}`,
          retryDelays: [ 0, 1000, 3000, 5000 ],
          metadata: {
            filename: file.name,
            filetype: file.type,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
          onError(error) {
            reject(error);
          },
          onProgress(bytesUploaded, bytesTotal) {
            const percent = Math.floor((bytesUploaded / bytesTotal) * 100);
            onProgress && onProgress(percent);
          },
          onSuccess: (result) => resolve(result.lastResponse.getHeader("Location")),
        });

        // // 2026.05.31 / causing bugs in post-processing
        // upload.findPreviousUploads().then((previous) => {
        //   if (previous.length > 0 && previous[0] !== undefined) {
        //     upload.resumeFromPreviousUpload(previous[0]);
        //   }
        //   upload.start();
        // }).catch(reject);

        upload.start();
      });
      if (result === undefined) throw new Error("Upload completed, but the the file's ID was not found.");
      return ({
        error: null,
        id: result.split(":").at(0)!, // file-id:version-id
      });
    } catch (error) {
      let message = error instanceof Error ? error.message : "Unknown error occurred";

      // try to parse an API error
      if (error instanceof DetailedError) {
        try {
          const body = error.originalResponse?.getBody();
          if (body) {
            const result = JSON.parse(body);
            if (typeof result.error === "string") message = result.error;
          }
        } catch {}
      }

      return ({
        id: null,
        error: message,
      });
    }
  }

  async _uploadVersion(file: File, props: {
    file: Pick<Tables<"files">, "id" | "folder_id">
    organization: Pick<Tables<"organizations">, "id">;
    onProgress?: (progressPercentInteger: number) => unknown;
  }): Promise<{
    id: string;
    error: null
  } | {
    error: string;
    id: null;
  }> {
    return this.__upload(`/v1/organizations/${props.organization.id}/folders/${props.file.folder_id}/files/${props.file.id}/upload`, file, props.onProgress)
  }

  async _uploadFile(file: File, { organization, folder, onProgress }: {
    organization: Pick<Tables<"organizations">, "id">;
    folder: Pick<Tables<"folders">, "id">;
    onProgress?: (progressPercentInteger: number) => unknown;
  }): Promise<{
    id: string;
    error: null
  } | {
    error: string;
    id: null;
  }> {
    return this.__upload(`/v1/organizations/${organization.id}/folders/${folder.id}/upload`, file, onProgress);
  }
}