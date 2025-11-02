export {};

declare global {

  type RuntimeEnvironment = {
    SUPABASE_JWT_SECRET: string;
    SUPABASE_PUBLIC_URL: string;
    SUPABASE_PUBLIC_KEY: string;
    MODE: "self-hosted" | "standalone";
  };

  type BrowserRuntimeEnvironment = Pick<RuntimeEnvironment, "MODE" | "SUPABASE_PUBLIC_KEY" | "SUPABASE_PUBLIC_URL">

  namespace NodeJS {
    interface ProcessEnv extends RuntimeEnvironment {
    }
  }

  interface Window {
    env: BrowserRuntimeEnvironment;
  }
}