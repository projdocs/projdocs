import { SupabaseRuntimeEnvironment } from "@workspace/supabase/types";



export {};

export type RuntimeEnvironment = SupabaseRuntimeEnvironment & {
  MODE: "self-hosted" | "standalone";
  HOSTNAME: string;
};

export type BrowserRuntimeEnvironment = Pick<RuntimeEnvironment,
  | "MODE"
  | "SUPABASE_PUBLIC_KEY"
  | "SUPABASE_PUBLIC_URL"
  | "HOSTNAME"
>


declare global {


  namespace NodeJS {
    interface ProcessEnv extends RuntimeEnvironment {
    }
  }

  interface Window {
    env: BrowserRuntimeEnvironment;
  }
}