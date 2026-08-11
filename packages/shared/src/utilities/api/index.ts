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

  constructor(supabase: SupabaseClient<Database>, host: string, options?: {
    download?: DownloadOptions;
    upload?: UploadOptions;
  }) {
    this.origin = (new URL(host)).origin;
    this.downloader = new MultiPartDownloadClient(supabase, this.origin, options?.download);
    this.uploader = new MultiPartUploadClient(supabase, this.origin, options?.upload);
  }

  async uploadFile(
    file: File | Blob,
    organization: Pick<Tables<"organizations">, "id">,
    folder: Pick<Tables<"folders">, "id">,
    options: UploadOptions = {},
  ) {
    return this.uploader.upload({
      file,
      organization,
      folder,
    }, options);
  }

  async uploadVersion(
    file: File | Blob,
    parent: Pick<Tables<"files">, "id" | "folder_id">,
    organization: Pick<Tables<"organizations">, "id">,
    options: UploadOptions = {},
  ) {
    return this.uploader.upload({
      file,
      parent,
      organization,
    }, options);
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
}