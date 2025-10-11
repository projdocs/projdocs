/// <reference types="office-js" />

type Action = (event?: {
  completed?: () => void;
}) => Promise<void>;

Office.onReady(async () => {
  // Associate command handlers (ESM-friendly)
  Office.actions.associate("launchProjDocs", launchProjDocs);
  Office.actions.associate("save", save);
  Office.actions.associate("saveAsNewVersion", saveAsNewVersion);
  Office.actions.associate("saveAsNewFile", saveAsNewFile);

  // If the runtime was auto-started on open, do the same init
  // @ts-expect-error onStartup is in runtime but missing from types
  Office.addin.onStartup(async () => {
    await initializeProjDocsForThisDoc();
  });
}).catch((e) => console.error(e));


const launchProjDocs: Action = async (event) => {
  try {
    const current = await Office.addin.getStartupBehavior();
    if (current !== Office.StartupBehavior.load) {
      await Office.addin.setStartupBehavior(Office.StartupBehavior.load);
    }
    await initializeProjDocsForThisDoc();
  } finally {
    event?.completed && event.completed();
  }
}

// ---- One-time-per-open initialization ----
async function initializeProjDocsForThisDoc() {
  await setButtonEnabled("SaveButton", false)
}

const setButtonEnabled = async (id: string, enabled: boolean = true) => {
  await waitForRibbon();
  return Office.ribbon.requestUpdate({
    tabs: [{
      id: "TabHome",
      groups: [{
        id: "CommandsGroup",
        controls: [{ id, enabled }]
      }]
    }]
  });
}

const save: Action = async (event) => {
  console.log("✅ save() was called");
  await __open("save");
  if (event !== undefined && "completed" in event && event.completed !== undefined) event.completed();
  return Promise.resolve();
};

const saveAsNewVersion: Action = async (event) => {
  console.log("✅ saveAsNewVersion() was called");
  await __open("save-as-new-version");
  if (event !== undefined && "completed" in event && event.completed !== undefined) event.completed();
  return Promise.resolve();
};

const saveAsNewFile: Action = async (event) => {
  console.log("✅ saveAsNewFile() was called");
  await __open("save-as-new-file");
  if (event !== undefined && "completed" in event && event.completed !== undefined) event.completed();
  return Promise.resolve();
};

const __open = async (target: string) =>
  await new Promise((resolve) => {
    Office.context.ui.displayDialogAsync(
      new URL(`/index.html?target=${target}`, window.location.origin).toString(),
      { height: 40, width: 30 },
      (result) => {
        const dialog: Office.Dialog = result.value;
        dialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg) => {
          if (arg && "message" in arg) {

            console.log("received message:", arg.message);

            switch (arg.message) {
              case "CLOSE":
                dialog.close();
                resolve("closed");
                break;
            }
          }
        });
      }
    );
  });


async function waitForRibbon(maxTries = 10, delayMs = 300) {
  for (let i = 0; i < maxTries; i++) {
    try {
      // Try a no-op request to see if Ribbon is ready
      await Office.ribbon.requestUpdate({ tabs: [] });
      return; // success → ribbon ready
    } catch {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  console.warn("Ribbon never became ready; continuing anyway");
}