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
export function register() {

  const runtime: RuntimeEnvironment = {
    SUPABASE_JWT_SECRET: "",
    SUPABASE_PUBLIC_URL: "",
    SUPABASE_PUBLIC_KEY: "",
    MODE: "self-hosted"
  }

  // check environment variables
  for (const envKey of Object.keys(runtime)) {
    if (!process.env[envKey]?.trim()) {
      console.error(` ${red("✗")} Runtime environment variable "${envKey}" is not defined!`);
      process.exitCode = 1;
      process.exit(1);
    } else {
      console.log(` ${green("✓")} Runtime environment variable "${envKey}" set`);
    }
  }

}