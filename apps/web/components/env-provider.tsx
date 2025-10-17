import { ReactNode } from "react";



export default function EnvProvider({ children }: { children: ReactNode }) {
  const env: BrowserRuntimeEnvironment = {
    SUPABASE_PUBLIC_URL: process.env.SUPABASE_PUBLIC_URL ?? "",
    SUPABASE_PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY ?? "",
    MODE: process.env.MODE ?? "standalone"
  };

  return (
    <>
      {/* Inject into global window.env */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.env = ${JSON.stringify(env)};`,
        }}
      />
      {children}
    </>
  );
}