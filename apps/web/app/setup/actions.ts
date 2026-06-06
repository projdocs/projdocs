import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@packages/supabase";



const isApiResponse = (o: unknown) => {
  if (typeof o !== "object" || o === null) return false;
  if (!("data" in o) || !("error" in o)) return false;
  if (typeof o.error !== "string" && o.error !== null) return false;
  return true;
}

export type GetOrganizationsResult = ReturnType<typeof getOrganizations>;

export const getOrganizations = (supabase: SupabaseClient<Database>) => supabase.from("organizations").select();

export type GetStorageProvidersResult = ReturnType<typeof getStorageProviders>;


export const getStorageProviders = (supabase: SupabaseClient<Database>) => supabase.from("storage_providers").select("id, display, type, is_valid, created_at");


export type GetAuthProvidersResult = ReturnType<typeof getAuthProviders>;

export const getAuthProviders = async (api: string): Promise<{
  data: {
    id: string;
    identifier: string;
    display: string;
  }[];
  error: null
} | {
  data: null;
  error: string;
}> => {
  try {
    const request = await fetch(`${api}/public/auth/providers`, {
      method: "GET",
    });
    const response = await request.json();
    if (isApiResponse(response)) return response;
    return {
      data: null,
      error: "Unable to fetch authentication providers!",
    }
  } catch (error) {
    return {
      data: null,
      error: "Unable to fetch authentication providers!",
    }
  }
};