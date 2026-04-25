import { Enums } from "@packages/supabase/types.gen";
import {
  GoogleDriveConfigSchema,
  S3ConfigSchema,
} from "@apps/web/lib/storage/type";
import { UseFormReturn } from "react-hook-form";
import {z} from "zod";


export const formSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("S3" satisfies Enums<"settings_storage_type">),
    s3: S3ConfigSchema,
  }),
  z.object({
    type: z.literal("GOOGLE_DRIVE" satisfies Enums<"settings_storage_type">),
    googleDrive: GoogleDriveConfigSchema,
  }),
  z.object({
    type: z.literal("BUILT_IN" satisfies Enums<"settings_storage_type">),
  }),
]);

export type Form<T extends Enums<"settings_storage_type">> = UseFormReturn<
  Extract<z.infer<typeof formSchema>, { type: T }>
>;
