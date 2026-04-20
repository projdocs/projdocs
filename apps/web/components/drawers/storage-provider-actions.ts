"use server";

import { createServiceRoleClient } from "@apps/web/lib/supabase/server";
import { StorageProviderDrawerForm } from "@apps/web/components/drawers/storage-provider";
import { isAdmin } from "@apps/web/lib/utils-server";

export const createStorageProvider = async (
  form: StorageProviderDrawerForm
) => {
  if (!(await isAdmin())) throw new Error("unauthorized!");

  const supabase = await createServiceRoleClient();
  const { error } = await supabase
    .from("storage_providers")
    .insert({
      type: form.type,
      data:
        form.type === "BUILT_IN"
          ? {}
          : form.type === "GOOGLE_DRIVE"
            ? JSON.parse(form.data)
            : form.type === "S3"
              ? {
                  bucket: form.s3.bucket,
                  accessKeyId: form.s3.keys.access,
                  secretKey: form.s3.keys.secret,
                  endpoint: form.s3.url,
                  region: form.s3.region,
                }
              : {},
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
};
