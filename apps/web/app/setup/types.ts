import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { SetupProjDocsStore } from "@workspace/web/app/setup/store";



export type Step = {
  title: string;
  icon: LucideIcon;
  component: (store: SetupProjDocsStore) => ReactNode;
  beforeNext?: (store: SetupProjDocsStore) => Promise<{ canContinue: boolean; error?: string }>;
}