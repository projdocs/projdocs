import { Database, Tables } from "@packages/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { StorageError, StorageResponse } from "@packages/shared/utilities/storage/type";



function sanitizeFilename(name: string, fallback = "upload"): string {
  const cleaned = name
    .normalize("NFC")
    .replace(/[^a-zA-Z0-9 _\-.]/g, "")
    .replace(/^[\s.]+|[\s.]+$/g, "")   // no leading/trailing dots or spaces
    .slice(0, 255);

  return cleaned === "" ? fallback : cleaned;
}

async function digest(blob: Blob): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export interface UploadOptions {
  chunkSize?: number; // default 5MB
  onProgress?: (uploaded: number, total: number) => void;
}

export class MultiPartUploadClient {
  private readonly chunkSize: number;

  constructor(
    private readonly supabase: SupabaseClient<Database>,
    private readonly baseUrl: string,
    options: UploadOptions = {},
  ) {
    this.chunkSize = options.chunkSize ?? 5 * 1024 * 1024;
  }

  async upload(
    file: File | Blob,
    organization: Pick<Tables<"organizations">, "id">,
    folder: Pick<Tables<"folders">, "id">,
    options: UploadOptions = {},
  ): Promise<StorageResponse<Tables<"files_versions">>> {
    try {
      const chunkSize = options.chunkSize ?? this.chunkSize;

      // create upload
      const uploadID = await this.createUpload(file, organization, folder);

      // upload each chunk iteratively
      await this.uploadChunks(file, organization, folder, chunkSize, uploadID, options.onProgress);

      // complete the upload
      return await this.completeUpload(organization, folder, uploadID);
    } catch (e) {
      console.error(e);
      return StorageResponse.Error(new StorageError(
        typeof e === "string"
          ? e
          : e instanceof Error
            ? e.message :
            JSON.stringify(e),
      ));
    }
  }

  private async createUpload(
    file: File | Blob,
    organization: Pick<Tables<"organizations">, "id">,
    folder: Pick<Tables<"folders">, "id">,
  ): Promise<string> {

    const res = await fetch(
      `${this.baseUrl}/v1/organizations/${organization.id}/folders/${folder.id}/upload`,
      {
        method: "POST",
        headers: {
          ...await this.getHeaders(),
          "X-File-Name": sanitizeFilename("name" in file ? file.name : "upload"),
          "X-File-Size": String(file.size),
          "X-File-Type": file.type || "application/octet-stream",
        },
      },
    );

    if (res.status !== 201) throw new Error("Unable to create upload request!");

    const uploadID = res.headers.get("Location");
    if (!uploadID) throw new Error("Upload request did not return an upload-id.");

    return uploadID;
  }

  private async uploadChunks(
    file: File | Blob,
    organization: Pick<Tables<"organizations">, "id">,
    folder: Pick<Tables<"folders">, "id">,
    chunkSize: number,
    uploadID: string,
    onProgress?: UploadOptions["onProgress"],
    retries = 4,
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(1000 * 2 ** attempt + Math.random() * 500, 15000);
        await new Promise((res) => setTimeout(res, delay));
      }

      try {
        const chunks = Math.ceil(file.size / chunkSize);

        // process each chunk
        for (let chunk = 0; chunk < chunks; chunk++) {

          const startingByte = chunk * chunkSize;
          const blob = file.slice(startingByte, startingByte + chunkSize);
          const endingByte = startingByte + blob.size - 1;

          const res = await fetch(
            `${this.baseUrl}/v1/organizations/${organization.id}/folders/${folder.id}/upload/${uploadID}`,
            {
              method: "PATCH",
              headers: {
                ...await this.getHeaders(),
                "Content-Type": "application/octet-stream",
                "Content-Range": `bytes ${startingByte}-${endingByte}/${file.size}`,
                "ETag": await digest(blob),
              },
              body: blob,
            },
          );
          if (res.status !== 200) throw new Error(`Failed to upload chunk ${chunk + 1}!`);
          onProgress?.(endingByte + 1, file.size);
        }

        // done
        return;
      } catch (err) {
        if ((err as Error).message.startsWith("Fatal")) throw err;
        lastError = err as Error;
      }
    }

    throw lastError ?? new Error(`Failed to upload chunks after ${retries} attempts`);
  }

  private async completeUpload(
    organization: Pick<Tables<"organizations">, "id">,
    folder: Pick<Tables<"folders">, "id">,
    uploadID: string,
  ): Promise<StorageResponse<Tables<"files_versions">>> {

    const res = await fetch(
      `${this.baseUrl}/v1/organizations/${organization.id}/folders/${folder.id}/upload/${uploadID}/complete`,
      {
        method: "POST",
        headers: { ...await this.getHeaders() },
      },
    );

    if (res.status !== 202) throw new Error("Unable to complete upload request!");

    return await res.json();
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const session = await this.supabase.auth.getSession();
    if (session.error) throw new Error(`Authentication error: ${session.error.message}`);

    const token = session.data.session?.access_token;
    if (!token) throw new Error("No active session—please sign in again.");

    return {
      Authorization: `Bearer ${token}`,
    };
  }
}