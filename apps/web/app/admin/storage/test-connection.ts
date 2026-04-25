"use server";
import { createServiceRoleClient } from "@apps/web/lib/supabase/server";
import "server-only";
import { StorageProvider } from "@apps/web/lib/storage";

export const testConnection = async (id: string): Promise<Error | null> => {


  const supabase = await createServiceRoleClient();

  const { data, error } = await supabase
    .from("storage_providers")
    .select()
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);

  const storage = StorageProvider.from(data);
  if (storage.error) throw new Error(storage.error);

  const test = await storage.provider!.test();
  if (test.error) {
    console.error(test.error);
    throw new Error(test.error.message);
  }

  console.log(test.data);

  if (!test.data) throw new Error("test failed");
  return null;
};
