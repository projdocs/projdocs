import { Step } from "@workspace/web/app/setup/types";
import { SetupCompany } from "@workspace/web/app/setup/steps/1-setup-company";
import { SetupDefaultPermissions } from "@workspace/web/app/setup/steps/2-default-permissions";
import { SetupComplete } from "@workspace/web/app/setup/steps/3-complete";



export const steps: ReadonlyArray<Step> = [
  SetupCompany,
  SetupDefaultPermissions,
  SetupComplete
];