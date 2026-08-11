import * as tus from "tus-js-client";
import { DetailedError } from "tus-js-client";
import { Database, Tables } from "@packages/supabase";
import { DownloadOptions, MultiPartDownloadClient } from "@packages/shared/utilities/api/download";
import { SupabaseClient } from "@supabase/supabase-js";
import { MultiPartUploadClient, UploadOptions } from "@packages/shared/utilities/api/upload";



type UploadResult = {
  data: {
    file: {
      id: string;
    };
    version: {
      id: string;
    }
  }
  error: null
} | {
  error: string;
  data: null;
}

export class ProjDocsAPI {

  private readonly origin: string;
  private readonly downloader: MultiPartDownloadClient;
  private readonly uploader: MultiPartUploadClient;
  private readonly supabase: SupabaseClient<Database>;

  constructor(supabase: SupabaseClient<Database>, host: string, options?: {
    download?: DownloadOptions;
    upload?: UploadOptions;
  }) {
    this.supabase = supabase;
    this.origin = (new URL(host)).origin;
    this.downloader = new MultiPartDownloadClient(supabase, this.origin, options?.download);
    this.uploader = new MultiPartUploadClient(supabase, this.origin, options?.upload);
  }

  async upload(
    file: File | Blob,
    organization: Pick<Tables<"organizations">, "id">,
    folder: Pick<Tables<"folders">, "id">,
    options: UploadOptions = {},
  ) {
    return this.uploader.upload(file, organization, folder, options);
  }

  async download(organization: Pick<Tables<"organizations">, "id">,
                 file: Pick<Tables<"files">, "folder_id" | "id">,
                 version: Pick<Tables<"files_versions">, "id">,
                 options: DownloadOptions = {},
  ) {
    return this.downloader.download(organization, file, version, options);
  }

  static from(supabase: SupabaseClient<Database>, host: string, options?: {
    download: DownloadOptions;
  }) {
    return new ProjDocsAPI(supabase, host, options);
  }

  private async __upload(path: string, file: File, onProgress?: (progressPercentInteger: number) => unknown): Promise<UploadResult> {

    try {
      const session = await this.supabase.auth.getSession();
      if (session.error) throw new Error(`Authentication error: ${session.error.message}`);

      const token = session.data.session?.access_token;
      if (!token) throw new Error("No active session—please sign in again.");

      const result = await new Promise<string | undefined>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          chunkSize: 10 * 1024 * 1024,
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

      // file-id:version-id
      const parts = result.split(":");
      if (parts.length !== 2) throw new Error("Upload failed: result unexpected!");

      return ({
        error: null,
        data: {
          file: { id: parts[0]! },
          version: { id: parts[1]! },
        },
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
        data: null,
        error: message,
      });
    }
  }

  async _uploadVersion(file: File, props: {
    file: Pick<Tables<"files">, "id" | "folder_id">
    organization: Pick<Tables<"organizations">, "id">;
    onProgress?: (progressPercentInteger: number) => unknown;
  }): Promise<UploadResult> {
    return this.__upload(`/v1/organizations/${props.organization.id}/folders/${props.file.folder_id}/files/${props.file.id}/upload`, file, props.onProgress);
  }

  async _uploadFile(file: File, { organization, folder, onProgress }: {
    organization: Pick<Tables<"organizations">, "id">;
    folder: Pick<Tables<"folders">, "id">;
    onProgress?: (progressPercentInteger: number) => unknown;
  }): Promise<UploadResult> {
    return this.__upload(`/v1/organizations/${organization.id}/folders/${folder.id}/upload`, file, onProgress);
  }
}