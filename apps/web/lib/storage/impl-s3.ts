import {
  StorageError,
  StorageResponse,
} from "@apps/web/lib/storage/type";
import {
  _Object as StorageObject,
  CommonPrefix,
  HeadObjectCommand,
  ListObjectsV2Output,
  paginateListObjectsV2,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { StorageProviderBase } from "@apps/web/lib/storage/provider";

export type S3StorageConnectionSettings = {
  url: string;
  region: string;
  bucket: string;
  keys: {
    access: string;
    secret: string;
  };
};

export class S3StorageProvider extends StorageProviderBase<StorageObject> {
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

  async _mkdir(path: string): Promise<StorageResponse<StorageObject>> {
    const key = (path.endsWith("/") ? path : `${path}/`).replace(/^\/+/, "");
    if (!S3StorageProvider.isValidFolderPath.test(key))
      return StorageResponse.Error(new StorageError("invalid path"));
    return StorageResponse.Data(
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: "",
          ContentLength: 0,
        })
      )
    );
  }

  async _test(): Promise<StorageResponse<boolean>> {
    const key = ".connection-test";

    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      );

      return StorageResponse.Data(true);
    } catch (err: any) {
      const isNotFound =
        err?.$metadata?.httpStatusCode === 404 ||
        err?.name === "NotFound" ||
        err?.name === "NoSuchKey";

      if (!isNotFound) {
        return StorageResponse.Data(false);
      }
    }

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: "",
          ContentType: "text/plain",
        })
      );
      return StorageResponse.Data(true);
    } catch {
      return StorageResponse.Data(false);
    }
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

      return StorageResponse.Data([...files, ...folders]);
    });
  }
}
