import { Step } from "@workspace/admin/components/setup-projdocs/types.ts";
import { setupDatabase } from "@workspace/admin/components/setup-projdocs/steps/1-db.tsx";
import { setupAuth } from "@workspace/admin/components/setup-projdocs/steps/2-auth.tsx";



export const steps: ReadonlyArray<Step> = [
  setupDatabase,
  setupAuth,
];