import { z } from "zod";

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // ProjDocs
  PROJDOCS_API_URL: z.url(),

  // Supabase
  SUPABASE_KONG_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().startsWith("sb_publishable_"),
  SUPABASE_SECRET_KEY: z.string().startsWith("sb_secret_"),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export const validate = () => {
  const parsed = EnvironmentSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error("❌ Invalid environment variables:\n" + formatted);
    process.exit(1);
  }
}