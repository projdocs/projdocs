import { StorageError, StorageResponse } from "@apps/web/lib/storage/type";
import { S3ServiceException } from "@aws-sdk/client-s3";

export abstract class StorageProviderBase {
  abstract _mkdir(path: string): Promise<StorageResponse<string>>;

  abstract _test(): Promise<StorageResponse<boolean>>;

  public async mkdir(path: string): Promise<StorageResponse<string>> {
    return await this.safely(async () => {
      return await this._mkdir(path);
    });
  }

  public async test(): Promise<StorageResponse<boolean>> {
    return await this.safely(() => this._test());
  }

  async safely<T>(
    f: () => Promise<StorageResponse<T>>
  ): Promise<StorageResponse<T>> {
    try {
      return await f();
    } catch (error) {
      if (error instanceof S3ServiceException)
        return StorageResponse.Error(
          new StorageError(`S3 error: ${error.name} - ${error.message}`, {
            from: error,
          })
        );

      return StorageResponse.Error(
        new StorageError("an unexpected error occurred", {
          from: error,
        })
      );
    }
  }
}
