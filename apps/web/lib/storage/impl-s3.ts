import { StorageError, StorageProvider, StorageResponse } from "@apps/web/lib/storage/type";
import {
  _Object as StorageObject,
  CommonPrefix,
  ListObjectsV2Output,
  paginateListObjectsV2,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

export type S3StorageConnectionSettings = {
  url: string;
  region: string;
  bucket: string;
  keys: {
    access: string;
    secret: string;
  };
};

export class S3StorageProvider extends StorageProvider<CommonPrefix, StorageObject> {
  private readonly client: S3Client;
  private readonly bucket: string;

  static readonly isValidFolderPath = /^(?!\/)[a-zA-Z0-9._\-\/]+\/$/;

  constructor(conn: S3StorageConnectionSettings) {
    super();
    this.bucket = conn.bucket;
    this.client = new S3Client({
      forcePathStyle: true,
      region: conn.region,
      endpoint: conn.url,
      credentials: {
        accessKeyId: conn.keys.access,
        secretAccessKey: conn.keys.secret,
      },
    });
  }

  async mkdir(path: string): Promise<StorageResponse<StorageObject>> {
    const key = (path.endsWith("/") ? path : `${path}/`).replace(/^\/+/, "");
    if (!S3StorageProvider.isValidFolderPath.test(key)) return ({
      error: new StorageError("invalid path"),
      data: null,
    })
    return this.safely(async () => ({
      error: null,
      data: await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: "",
          ContentLength: 0,
        })
      ),
    }));
  }

  async ls(path: string = "") {
    return this.safely(async () => {
      const files: ListObjectsV2Output["Contents"] = [];
      const folders: CommonPrefix[] = [];

      // loop over each page
      for await (const page of paginateListObjectsV2(
        { client: this.client },
        {
          Bucket: this.bucket,
          Prefix: path,
          Delimiter: "/",
        }
      )) {
        files.push(...(page.Contents ?? []));
        folders.push(...(page.CommonPrefixes ?? []));
      }

      return {
        data: [...files, ...folders],
        error: null,
      };
    });
  }
}
