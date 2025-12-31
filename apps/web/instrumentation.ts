import { RuntimeEnvironment } from "@workspace/web/types/env";



const red = (s: string) => {
  const red = "\x1b[31m";
  const reset = "\x1b[0m";
  return `${red}${s}${reset}`;
};

const green = (s: string) => {
  const green = "\x1b[32m";
  const reset = "\x1b[0m";
  return `${green}${s}${reset}`;
};

/**
 * called once on app start
 */
export async function register() {

  const runtime: RuntimeEnvironment = {
    SUPABASE_JWT_SECRET: "",
    SUPABASE_PUBLIC_URL: "",
    SUPABASE_PUBLIC_KEY: "",
    HOSTNAME: "",
    MODE: "self-hosted",
  };

  // check environment variables
  for (const envKey of Object.keys(runtime)) {
    if (!process.env[envKey]?.trim()) {
      throw new Error(` ${red("✗")} Runtime environment variable "${envKey}" is not defined!`);
    } else {
      console.log(` ${green("✓")} Runtime environment variable "${envKey}" set`);
    }
  }

  // check supabase connection
  const base = process.env.SUPABASE_PUBLIC_URL?.replace(/\/$/, "");
  try {
    const resp = await fetch(`${base}/auth/v1/health`);
    const data = await resp.json();
    console.log(` ${green("✓")} Connected to Supabase (Auth ${data.version})`);
  } catch (error) {
    throw new Error(`cannot connect to supabase: ${error}`);
  }

}