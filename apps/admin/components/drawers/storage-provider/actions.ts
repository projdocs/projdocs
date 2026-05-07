"use server";

import { Enums } from "@packages/supabase/types.gen";
import { Form } from "@apps/admin/components/drawers/storage-provider/types";
import { createServiceRoleClient } from "@apps/admin/lib/supabase";

export async function onSubmit(form: Form<Enums<"settings_storage_type">>) {
  const supabase = await createServiceRoleClient();
  const { error } = await supabase
    .from("storage_providers")
    .insert({
      type: form.type,
      data:
        form.type === "GOOGLE_DRIVE"
          ? form.googleDrive
          : form.type === "S3"
            ? form.s3
            : {},
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
}