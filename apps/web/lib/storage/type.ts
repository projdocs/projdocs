import { S3ServiceException } from "@aws-sdk/client-s3";

export abstract class StorageProvider<
  DirectoryType extends object,
  FileType extends object,
> {
  abstract ls(
    path: string
  ): Promise<StorageResponse<ReadonlyArray<DirectoryType | FileType>>>;

  abstract mkdir(path: string): Promise<StorageResponse<FileType>>;

  async safely<T>(
    f: () => Promise<StorageResponse<T>>
  ): Promise<StorageResponse<T>> {
    try {
      return await f();
    } catch (error) {
      if (error instanceof S3ServiceException)
        return {
          error: new StorageError(
            `S3 error: ${error.name} - ${error.message}`,
            {
              from: error,
            }
          ),
          data: null,
        };

      return {
        error: new StorageError("an unexpected error occurred", {
          from: error,
        }),
        data: null,
      };
    }
  }
}

export type StorageResponse<T> =
  | {
      data: T;
      error: null;
    }
  | {
      error: StorageError;
      data: null;
    };

export class StorageError extends Error {
  private readonly _title: string;
  private readonly _description: string | object | undefined;
  private readonly _from: unknown;

  constructor(
    title: string,
    props?: {
      description?: string | object;
      from?: unknown;
    }
  ) {
    super();
    this._title = title;
    this._description = props?.description;
    this._from = props?.from;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | object | undefined {
    return this._description;
  }

  get from(): unknown {
    return this._from;
  }
}
