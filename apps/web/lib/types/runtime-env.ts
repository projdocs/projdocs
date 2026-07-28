import { z } from "zod";

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PROJDOCS_API_URL: z.url(),
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