import { Actions } from "@workspace/word/lib/actions";
import { CONSTANTS } from "@workspace/word/lib/consts";




type EventHandler = (event: Office.AddinCommands.Event) => Promise<void>;



const safely = (action: Action): EventHandler => async (event) => {
  try {
    await action();
  } catch (e) {
    console.error(e);
  } finally {
    event.completed();
  }
};

export const Ribbon = {
  setup: async () => {
    Office.actions.associate(CONSTANTS.BUTTONS.LAUNCH.FUNC_ID, safely(Actions.launch));
    Office.actions.associate(CONSTANTS.BUTTONS.SAVE.FUNC_ID, safely(Actions.save));
    Office.actions.associate(CONSTANTS.BUTTONS.SAVE_AS_NEW_VERSION.FUNC_ID, safely(Actions.saveAsNewVersion));
    Office.actions.associate(CONSTANTS.BUTTONS.SAVE_AS_NEW_DOCUMENT.FUNC_ID, safely(Actions.saveAsNewFile));
    await Actions.launch();
  }
};
