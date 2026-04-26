import { Tables } from "@packages/supabase/types.gen";
import { StorageProviderBase } from "@apps/web/lib/storage/provider";
import { BuiltInStorageProvider } from "@apps/web/lib/storage/impl-built-in";
import { S3StorageProvider } from "@apps/web/lib/storage/impl-s3";
import { GoogleDriveConfig, S3Config } from "@apps/web/lib/storage/type";
import { GoogleDriveStorageProvider } from "@apps/web/lib/storage/impl-google-drive";

export class StorageProvider {
  public static from = (
    from: Tables<"storage_providers">
  ):
    | { error: string; provider: null }
    | { error: null; provider: StorageProviderBase } => {
    if (!from.is_valid) return { error: "provider is invalid", provider: null };
    switch (from.type) {
      case "BUILT_IN":
        if (!process.env.SUPABASE_KONG_URL)
          return { error: "SUPABASE_KONG_URL is invalid", provider: null };
        const kong = new URL(process.env.SUPABASE_KONG_URL);
        kong.pathname = "/storage/v1/s3";

        if (!process.env.SUPABASE_S3_ACCESS_KEY_ID)
          return {
            error: "SUPABASE_S3_ACCESS_KEY_ID is invalid",
            provider: null,
          };
        if (!process.env.SUPABASE_S3_SECRET_KEY)
          return { error: "SUPABASE_S3_SECRET_KEY is invalid", provider: null };

        return {
          error: null,
          provider: new BuiltInStorageProvider({
            url: kong.toString(),
            region: "local",
            bucket: "projdocs",
            keys: {
              access: process.env.SUPABASE_S3_ACCESS_KEY_ID,
              secret: process.env.SUPABASE_S3_SECRET_KEY,
            },
          }),
        };
      case "S3":
        return {
          error: null,
          provider: new S3StorageProvider({
            bucket: (from.data as S3Config).bucket,
            region: (from.data as S3Config).region,
            url: (from.data as S3Config).endpoint,
            keys: {
              access: (from.data as S3Config).accessKeyId,
              secret: (from.data as S3Config).secretKey,
            },
          }),
        };
      case "GOOGLE_DRIVE":
        return {
          error: null,
          provider: new GoogleDriveStorageProvider(
            (from.data as GoogleDriveConfig).jsonKey,
            (from.data as GoogleDriveConfig).parentID
          ),
        };
    }
  };
}
