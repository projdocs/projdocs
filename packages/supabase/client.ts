import { createBrowserClient } from "@supabase/ssr";
import { SupabaseBrowserRuntimeEnvironment, SupabaseClient } from "./types";



interface Window {
  env?: SupabaseBrowserRuntimeEnvironment;
}

export const createClientImpl = (url: string, anonKey: string, accessToken?: () => Promise<string | null>): SupabaseClient =>
  createBrowserClient(url, anonKey, { auth: { storageKey: "train360-dms" }, accessToken }) as unknown as SupabaseClient

export const createClient = (): SupabaseClient => {

  if ((window as Window) === undefined) throw new Error("window is undefined");
  if ((window as Window).env === undefined || typeof (window as Window).env !== "object") throw new Error("window.env is undefined");

  const url = (window as Window).env!.SUPABASE_PUBLIC_URL;
  if (!url) throw new Error("window.env.SUPABASE_PUBLIC_URL is undefined");

  const anonKey = (window as Window).env!.SUPABASE_PUBLIC_KEY;
  if (!anonKey) throw new Error("window.env.SUPABASE_PUBLIC_KEY is undefined");

  return createClientImpl(url, anonKey);
};