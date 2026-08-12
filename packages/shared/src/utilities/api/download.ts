import { CompositeTypes, Database, Tables } from "@packages/supabase";
import { md5 } from 'js-md5';
import { SupabaseClient } from "@supabase/supabase-js";



export interface FileVersionMeta {
  contentLength: number;
  etag: CompositeTypes<"checksum">;
  mimeType: string;
  contentID: string;
}

export interface DownloadOptions {
  chunkSize?: number; // default 5MB
  onProgress?: (downloaded: number, total: number) => void;
}

export class MultiPartDownloadClient {
  private readonly chunkSize: number;

  constructor(
    private readonly supabase: SupabaseClient<Database>,
    private readonly baseUrl: string,
    options: DownloadOptions = {},
  ) {
    this.chunkSize = options.chunkSize ?? 5 * 1024 * 1024;
  }

  async download(
    organization: Pick<Tables<"organizations">, "id">,
    file: Pick<Tables<"files">, "folder_id" | "id">,
    version: Pick<Tables<"files_versions">, "id">,
    options: DownloadOptions = {},
  ): Promise<{
    data: Blob;
    error: null;
  } | {
    data: null;
    error: string
  }> {
    try {
      const chunkSize = options.chunkSize ?? this.chunkSize;
      const onProgress = options.onProgress;

      // get metadata
      const { contentLength, etag, mimeType, contentID } = await this.head(organization.id, file.folder_id, file.id, version.id);

      // do download
      const chunks: BlobPart[] = [];
      let downloaded = 0;
      while (downloaded < contentLength) {
        const start = downloaded;
        const end = Math.min(start + chunkSize - 1, contentLength - 1);

        const chunk = await this.fetchChunk(
          organization.id,
          file.folder_id,
          file.id,
          version.id,
          contentID,
          start,
          end,
        );

        chunks.push(chunk);
        downloaded += end - start + 1;
        onProgress?.(downloaded, contentLength);
      }

      const blob = new Blob(chunks, { type: mimeType });


      let hash: string;
      switch (etag.algorithm) {
        case "md5":
          hash = await this.md5(blob);
          break;
        case "sha256":
          hash = await this.sha256(blob);
          break;
        default:
          throw new Error(`Unsupported hash: ${etag.algorithm}`)
      }

      if (hash !== etag.hash) return ({
        data: null,
        error: `Checksum mismatch: expected ${etag.hash}, got ${hash}`
      });

      return ({
        data: blob,
        error: null,
      });
    } catch (e) {
      console.error(e);
      return ({
        data: null,
        error: typeof e === "string"
          ? e
          : e instanceof Error
            ? e.message :
            JSON.stringify(e),
      });
    }
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

  private async head(organizationId: string, folderId: string, fileId: string, versionId: string): Promise<FileVersionMeta> {
    const res = await fetch(
      `${this.baseUrl}/v1/organizations/${organizationId}/folders/${folderId}/files/${fileId}/versions/${versionId}`,
      {
        method: "HEAD",
        headers: await this.getHeaders(),
      },
    );

    if (!res.ok) throw new Error(`HEAD failed: ${res.status}`);

    const etag = res.headers.get("ETag")?.replace(/^"|"$/g, "")?.split(":") ?? "";
    const checksum: CompositeTypes<"checksum"> = {
      algorithm: etag[0]! as any,
      hash: etag[1]!
    }

    return {
      contentLength: parseInt(res.headers.get("Content-Length") ?? "0", 10),
      etag: checksum,
      mimeType: res.headers.get("Content-Type") ?? "application/octet-stream",
      contentID: res.headers.get("Content-ID") ?? ""
    };
  }

  private async fetchChunk(
    organizationId: string,
    folderId: string,
    fileId: string,
    versionId: string,
    contentId: string,
    start: number,
    end: number,
    retries = 4,
  ): Promise<BlobPart> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      if (attempt > 0) {
        const delay = Math.min(1000 * 2 ** attempt + Math.random() * 500, 15000);
        await new Promise((res) => setTimeout(res, delay));
      }

      try {
        const res = await fetch(
          `${this.baseUrl}/v1/organizations/${organizationId}/folders/${folderId}/files/${fileId}/versions/${versionId}`,
          {
            method: "GET",
            headers: {
              ...await this.getHeaders(),
              "Range": `bytes=${start}-${end}`,
              "Content-ID": contentId,
            },
          },
        );

        // do not retry on these — they are deterministic failures
        if (res.status === 400 || res.status === 401 || res.status === 403 || res.status === 404 || res.status === 416) {
          throw new Error(`Fatal status ${res.status} for chunk ${start}-${end}`);
        }

        if (res.status !== 206) {
          lastError = new Error(`Unexpected status ${res.status} for chunk ${start}-${end}`);
          continue;
        }

        return new Uint8Array(await res.arrayBuffer());
      } catch (err) {
        if ((err as Error).message.startsWith("Fatal")) throw err;
        lastError = err as Error;
      }
    }

    throw lastError ?? new Error(`Failed to fetch chunk ${start}-${end} after ${retries} attempts`);
  }

  private async sha256(blob: Blob): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer());
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  private async md5(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer();
    return md5(buffer);
  }
}