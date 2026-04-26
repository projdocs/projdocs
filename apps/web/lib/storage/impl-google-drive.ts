import { StorageResponse } from "@apps/web/lib/storage/type";
import { JWT } from "google-auth-library";
import { drive_v3, google } from "googleapis";
import { StorageProviderBase } from "@apps/web/lib/storage/provider";

type FileType = drive_v3.Schema$File;

export class GoogleDriveStorageProvider extends StorageProviderBase {
  private readonly client: drive_v3.Drive;
  private readonly driveID: string;

  constructor(key: Record<string, string>, driveID: string) {
    super();
    const auth = new JWT({
      scopes: ["https://www.googleapis.com/auth/drive"],
    });
    auth.fromJSON({ ...key });

    this.driveID = driveID;
    this.client = google.drive({
      version: "v3",
      auth: auth,
    });
  }

  async _test(): Promise<StorageResponse<boolean>> {
    const {
      data: { files },
    } = await this.client.files.list({
      driveId: this.driveID,
      corpora: "drive",
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      q: `'${this.driveID}' in parents and name = '.connection-test' and trashed = false`,
      fields: "files(id, name)",
      pageSize: 1,
    });
    if (files && files.length > 0) return StorageResponse.Data(true);

    const { data: created } = await this.client.files.create({
      requestBody: {
        name: ".connection-test",
        parents: [this.driveID], // must be a FOLDER id
      },
      media: {
        mimeType: "text/plain",
        body: "",
      },
      supportsAllDrives: true,
      fields: "id",
    });
    if (created && created.id) return StorageResponse.Data(true);
    return StorageResponse.Data(false);
  }

  // async ls(path: string = ""): Promise<StorageResponse<ReadonlyArray<{}>>> {
  //   return await this.safely(async () => {
  //     const {
  //       data: { files },
  //     } = await this.client.files.list({
  //       driveId: this.driveID,
  //       corpora: "drive",
  //       includeItemsFromAllDrives: true,
  //       supportsAllDrives: true,
  //       q: `'${path.trim() || this.driveID}' in parents`,
  //     });
  //     return {
  //       data: files,
  //       error: null,
  //     };
  //   });
  // }

  async _mkdir(path: string): Promise<StorageResponse<string>> {
    const segments = path.replace(/^\//, "").split("/");
    let folder: FileType = { id: this.driveID };

    for (const segment of segments) {
      const res = await this.client.files.list({
        driveId: this.driveID,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        corpora: "drive",
        q: `'${folder.id}' in parents and name = '${segment}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: "files(id, name)",
      });

      const existing = res.data.files?.[0];

      if (existing?.id) folder = existing;
      else {
        const created = await this.client.files.create({
          supportsAllDrives: true,
          requestBody: {
            name: segment,
            mimeType: "application/vnd.google-apps.folder",
            parents: [folder.id!],
          },
          fields: "id",
        });

        if (!created.data.id)
          throw new Error(`Failed to create folder: ${segment}`);
        folder = created.data;
      }
    }

    return StorageResponse.Data(folder.id!);
  }
}
