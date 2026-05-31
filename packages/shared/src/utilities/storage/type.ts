import { Enums } from "@packages/supabase/types.gen";
import { z } from "zod";

export const StorageProviderTypes = {
  BUILT_IN: "Built-In",
  S3: "S3-Compatible API",
  GOOGLE_DRIVE: "Google Drive API",
} satisfies {
  [key in Enums<"settings_storage_type">]: string;
};

type IStorageResponse<T> =
  | {
  data: T;
  error: null;
}
  | {
  error: StorageError;
  data: null;
};

export class StorageResponse<T> {
  private readonly _data: T | null;
  private readonly _error: null | StorageError;

  private constructor({ data, error }: IStorageResponse<T>) {
    this._data = data;
    this._error = error;
  }

  public get error() {
    return this._error;
  }

  public get data() {
    return this._data;
  }

  public static Data<DT>(data: DT): StorageResponse<DT> {
    return new StorageResponse<DT>({ data, error: null });
  }

  public static Error(err: StorageError): StorageResponse<never> {
    return new StorageResponse<never>({ error: err, data: null });
  }

  public toResponse(status: number = 500): Response {
    return Response.json(this.toObject(), {
      status,
    });
  }

  public toString() {
    return JSON.stringify(this.toObject());
  }

  public toObject(): IStorageResponse<T> {
    if (this._error !== null)
      return {
        data: null,
        error: this._error,
      };
    return {
      data: this._data as T,
      error: null,
    };
  }
}

export class StorageError extends Error {
  private readonly _title: string;
  private readonly _description: string | object | undefined;
  private readonly _from: unknown;

  constructor(
    title: string,
    props?: {
      description?: string | object;
      from?: unknown;
    },
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

export const S3ConfigSchema = z
  .object({
    bucket: z.string().min(1),
    accessKeyId: z.string().min(1),
    secretKey: z.string().min(1),
    endpoint: z.string().min(1),
    region: z.string().min(1),
  })
  .strict();

export type S3Config = z.infer<typeof S3ConfigSchema>;

export const GoogleDriveConfigSchema = z
  .object({
    parentID: z.string().min(1),
    jsonKey: z
      .object({
        type: z.literal("service_account"),
        project_id: z.string().min(1),
        private_key_id: z.string().min(1),
        private_key: z
          .string()
          .regex(/^-----BEGIN PRIVATE KEY-----/, "Invalid private key format"),
        client_email: z
          .string()
          .regex(
            /^[^@]+@[^@]+\.iam\.gserviceaccount\.com$/,
            "Invalid service account email",
          ),
        client_id: z.string().min(1),
        auth_uri: z.literal("https://accounts.google.com/o/oauth2/auth"),
        token_uri: z.literal("https://oauth2.googleapis.com/token"),
        auth_provider_x509_cert_url: z.literal(
          "https://www.googleapis.com/oauth2/v1/certs",
        ),
        client_x509_cert_url: z
          .string()
          .regex(
            /^https:\/\/www\.googleapis\.com\/robot\/v1\/metadata\/x509\//,
            "Invalid cert URL",
          ),
        universe_domain: z.literal("googleapis.com"),
      })
      .strict(),
  })
  .strict();

export type GoogleDriveConfig = z.infer<typeof GoogleDriveConfigSchema>;
