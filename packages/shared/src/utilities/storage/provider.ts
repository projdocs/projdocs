import { S3ServiceException } from "@aws-sdk/client-s3";
import { StorageError, StorageResponse } from "@packages/shared/utilities/storage/type";

export type StorageProviderImplUpload = {
  mimeType: string;
  body: Buffer;
  name: string;
}

export abstract class StorageProviderImpl {
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

  abstract _upload(props: StorageProviderImplUpload): Promise<StorageResponse<string>>;

  public async upload(props: StorageProviderImplUpload): Promise<StorageResponse<string>> {
    return await this.safely(async () => {
      return await this._upload(props);
    });
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
