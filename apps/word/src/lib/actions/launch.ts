import { CONSTANTS } from "@workspace/word/lib/consts";
import { saveSettings } from "@workspace/word/lib/utils";



export const launch: Action = async () => {
  const current = await Office.addin.getStartupBehavior();
  if (current !== Office.StartupBehavior.load) {
    await Office.addin.setStartupBehavior(Office.StartupBehavior.load);
    Office.context.document.settings.set(CONSTANTS.SETTINGS.AUTOLOAD, true);
    await saveSettings();
  }
};