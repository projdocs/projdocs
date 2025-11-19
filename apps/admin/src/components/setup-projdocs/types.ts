import { SetupProjDocsStore } from "@workspace/admin/components/setup-projdocs/store.ts";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";



export type StepComponentProps = {
  store: SetupProjDocsStore
}

export type Step = {
  title: string;
  icon: LucideIcon;
  component: (props: StepComponentProps) => ReactNode;
  beforeNext?: (store: SetupProjDocsStore) => Promise<boolean>;
}