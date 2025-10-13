/// <reference types="office-js" />

type Action = (event: Office.AddinCommands.Event) => Promise<void>;

Office.initialize = () => {
  initializeForThisDocument().then();
};


// Associate command handlers (ESM-friendly)
Office.onReady(async () => {
  Office.actions.associate("launchProjDocs", launchProjDocs);
  Office.actions.associate("save", save);
  Office.actions.associate("saveAsNewVersion", saveAsNewVersion);
  Office.actions.associate("saveAsNewFile", saveAsNewFile);
}).catch((e) => console.error(e));

const launchProjDocs: Action = async (event) => {
  try {
    const current = await Office.addin.getStartupBehavior();
    if (current !== Office.StartupBehavior.load) {
      await Office.addin.setStartupBehavior(Office.StartupBehavior.load);
      Office.context.document.settings.set(CONSTANTS.SETTINGS.AUTOLOAD, true);
      await saveSettings();
    }

    // 2) Initialize ribbon state now (cold start)
    await initializeForThisDocument();
  } catch (e) {
    console.error("launchProjDocs error:", e);
  } finally {
    event.completed();
  }
};

// ───────────────────────────────────────────────────────────────────────────────
// Initialization logic (called on first click AND on future opens)
// ───────────────────────────────────────────────────────────────────────────────
async function initializeForThisDocument() {
  // Ensure Ribbon API is ready before updates
  await waitForRibbon();

  // Always disable everything briefly while we determine state (prevents flicker)
  await setButtons({
    [CONSTANTS.BUTTONS.LAUNCH.ID]: { enabled: false },
    [CONSTANTS.BUTTONS.SAVE.ID]: { enabled: false },
    [CONSTANTS.BUTTONS.SAVE_AS_NEW_VERSION.ID]: { enabled: false },
    [CONSTANTS.BUTTONS.SAVE_AS_NEW_DOCUMENT.ID]: { enabled: false },
  });

  const documentID = Office.context.document.settings.get(CONSTANTS.SETTINGS.REF);

  if (typeof documentID === "string" && documentID.length > 0) {
    // Document already registered with your backend
    await setButtons({
      [CONSTANTS.BUTTONS.LAUNCH.ID]: { enabled: false }, // hide/disable launcher once bootstrapped
      [CONSTANTS.BUTTONS.SAVE.ID]: { enabled: true },
      [CONSTANTS.BUTTONS.SAVE_AS_NEW_VERSION.ID]: { enabled: true },
      [CONSTANTS.BUTTONS.SAVE_AS_NEW_DOCUMENT.ID]: { enabled: false },
    });
  } else {
    // Not registered yet → only allow "Save as New Document"
    await setButtons({
      [CONSTANTS.BUTTONS.LAUNCH.ID]: { enabled: false }, // launcher pressed or autoloaded; keep disabled
      [CONSTANTS.BUTTONS.SAVE.ID]: { enabled: false },
      [CONSTANTS.BUTTONS.SAVE_AS_NEW_VERSION.ID]: { enabled: false },
      [CONSTANTS.BUTTONS.SAVE_AS_NEW_DOCUMENT.ID]: { enabled: true },
    });
  }
}

// ───────────────────────────────────────────────────────────────────────────────
// Settings helper (promisified)
// ───────────────────────────────────────────────────────────────────────────────
function saveSettings(): Promise<void> {
  return new Promise((resolve, reject) => {
    Office.context.document.settings.saveAsync((res) => {
      if (res.status === Office.AsyncResultStatus.Succeeded) resolve();
      else reject(res.error);
    });
  });
}

// ───────────────────────────────────────────────────────────────────────────────
// Ribbon helpers
// ───────────────────────────────────────────────────────────────────────────────
async function setButtons(map: Record<string, Omit<Office.Control, "id">>) {
  return Office.ribbon.requestUpdate({
    tabs: [
      {
        id: "TabHome",
        groups: [
          {
            id: "CommandsGroup",
            controls: Object.entries(map).map(([ id, control ]) => ({
              id,
              enabled: control.enabled,
            }) as Office.Control),
          },
        ],
      },
    ],
  });
}

const save: Action = async (event) => {
  console.log("✅ save() was called");
  try {
  } catch (e) {
    console.error("save error:", e);
  } finally {
    event.completed();
  }
};

const saveAsNewVersion: Action = async (event) => {
  console.log("✅ saveAsNewVersion() was called");
  try {
  } catch (e) {
    console.error("saveAsNewVersion error:", e);
  } finally {
    event.completed();
  }
};

const saveAsNewFile: Action = async (event) => {
  console.log("✅ saveAsNewFile() was called");
  try {

    const file = await getFileAsync(Office.FileType.Compressed);
    const bytes = await readAllSlices(file);
    const docxBlob = new Blob([ bytes ], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    await new Promise(() => Office.context.ui.displayDialogAsync(
      "https://localhost:3000/dialog.html",
      { height: 50, width: 50 },              // size in % of window
      (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          const dialog = result.value;

          dialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg: any) => {
            console.log("Message from dialog:", arg.message);
            if (arg.message === "close") {
              dialog.close();
            }
          });
        } else {
          console.error("Failed to open dialog:", result.error);
        }
      }
    ));

    const form = new FormData();
    form.append("file", docxBlob, "name" in Office.context.document && typeof Office.context.document.name === "string" && Office.context.document.name.trim().length > 0 ? Office.context.document.name : "document.docx");
    const res = await fetch("", { // TODO: FIX
      method: "POST",
      headers: { Authorization: `Bearer ${""}` }, // TODO: FIX
      body: form,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed: ${res.status} ${res.statusText} ${text}`);
    }

    return await res.json().catch(() => ({}));

  } catch (e) {
    console.error("saveAsNewFile error:", e);
  } finally {
    event.completed();
  }
};

// const __open = async (target: string) =>
//   await new Promise((resolve) => {
//     Office.context.ui.displayDialogAsync(
//       new URL(`/index.html?target=${target}`, window.location.origin).toString(),
//       { height: 40, width: 30 },
//       (result) => {
//         const dialog: Office.Dialog = result.value;
//         dialog.addEventHandler(Office.EventType.DialogMessageReceived, (arg) => {
//           if (arg && "message" in arg) {
//
//             console.log("received message:", arg.message);
//
//             switch (arg.message) {
//               case "CLOSE":
//                 dialog.close();
//                 resolve("closed");
//                 break;
//             }
//           }
//         });
//       }
//     );
//   });


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


const CONSTANTS = {
  SETTINGS: {
    REF: "ProjDocsRef",
    AUTOLOAD: "ProjDocsAutoLoad",
  },
  BUTTONS: {
    LAUNCH: { ID: "LaunchProjDocsButton" },
    SAVE: { ID: "SaveButton" },
    SAVE_AS_NEW_VERSION: { ID: "SaveAsNewVersionButton" },
    SAVE_AS_NEW_DOCUMENT: { ID: "SaveAsNewDocumentButton" },
  }
};


// ───────────────────────── helpers ─────────────────────────

function getFileAsync(fileType: Office.FileType): Promise<Office.File> {
  return new Promise((resolve, reject) => {
    Office.context.document.getFileAsync(fileType, (res) => {
      if (res.status === Office.AsyncResultStatus.Succeeded) resolve(res.value);
      else reject(res.error || new Error("getFileAsync failed"));
    });
  });
}

function getSliceAsync(file: Office.File, sliceIndex: number): Promise<Office.Slice> {
  return new Promise((resolve, reject) => {
    file.getSliceAsync(sliceIndex, (res) => {
      if (res.status === Office.AsyncResultStatus.Succeeded) resolve(res.value);
      else reject(res.error || new Error(`getSliceAsync(${sliceIndex}) failed`));
    });
  });
}

async function readAllSlices(file: Office.File): Promise<Uint8Array> {
  // Preallocate buffer if size is known; otherwise push to an array and concat.
  const chunks: Uint8Array[] = [];
  const sliceCount = file.sliceCount;

  for (let i = 0; i < sliceCount; i++) {
    const slice = await getSliceAsync(file, i);
    // slice.data might be a string (base64) or an ArrayBuffer / Uint8Array, depending on host.
    let chunk: Uint8Array;

    if (slice.data instanceof Uint8Array) {
      chunk = slice.data;
    } else if (slice.data instanceof ArrayBuffer) {
      chunk = new Uint8Array(slice.data);
    } else if (typeof slice.data === "string") {
      // base64 → bytes
      chunk = base64ToBytes(slice.data);
    } else {
      throw new Error("Unknown slice data type");
    }

    chunks.push(chunk);
  }

  // Concatenate all chunks
  const totalLen = chunks.reduce((n, c) => n + c.byteLength, 0);
  const out = new Uint8Array(totalLen);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

function base64ToBytes(b64: string): Uint8Array {
  // atob works in Office WebView; if you’re in Node for tests, use Buffer.from(b64, 'base64')
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i) & 0xff;
  return bytes;
}