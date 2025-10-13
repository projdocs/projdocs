// ---- at very top of main.ts (before windows) ----
import { app, BrowserWindow, ipcMain, Menu, shell } from "electron";
import path from "node:path";
import keytar from "keytar";
import { createTray, createTrayWindow, getTrayWindow } from "./tray";

// single-instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}

// Handle deep links for second instances (Win/Linux)
app.on("second-instance", async (_evt, argv) => {
  const link = argv.find(a => a.startsWith("projdocs://"));
  if (link) await handleDeepLink(link);

  const w = getTrayWindow();
  if (w) {
    if (w.isMinimized()) w.restore();
    w.show();
    w.focus();
  } else {
    createTrayWindow().then(w2 => {
      w2.show();
      w2.focus();
    });
  }
});

// ---- register the protocol per platform (DEV vs PROD) ----
function registerProtocol(): void {
  let registered = false;

  if (process.platform === "win32") {
    // Required before registration on Windows
    app.setAppUserModelId("com.projdocs.desktop");
    if (process.defaultApp) {
      // DEV: pass electron.exe + your main script as arg
      registered = app.setAsDefaultProtocolClient(
        "projdocs",
        process.execPath,
        [ path.resolve(process.argv[1]!) ]
      );
    } else {
      registered = app.setAsDefaultProtocolClient("projdocs");
    }
  } else {
    // macOS / Linux: NO args
    registered = app.setAsDefaultProtocolClient("projdocs");
  }

  console.log("[protocol] defaultApp:", !!process.defaultApp,
    "| platform:", process.platform,
    "| argv[1]:", process.argv[1],
    "| registered:", registered);

  // If registered=false, another app may already own the scheme,
  // or the call happened before ready on some environments.
}

// macOS delivers deep links to the running instance
app.on("open-url", async (event, url) => {
  event.preventDefault();
  await handleDeepLink(url);
});

// ---- app lifecycle ----
app.whenReady().then(async () => {
  // Register AFTER ready (more reliable on some setups)
  registerProtocol();

  if (process.platform === "darwin") {
    app.dock?.hide();
    app.setActivationPolicy?.("accessory");
  }
  Menu.setApplicationMenu(null);

  await createTrayWindow();
  createTray();

  // Optional: verify registration
  console.log("[protocol] isDefault:", app.isDefaultProtocolClient("projdocs"));
});

app.on("activate", async () => {
  const w = BrowserWindow.getAllWindows()[0] || await createTrayWindow();
  w.show();
  w.focus();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ---- IPCs ----

ipcMain.handle("app:quit", () => app.quit());

ipcMain.handle("app:open", async (_, url: string) => shell.openExternal(url));

ipcMain.handle("app:hide", async () => getTrayWindow()?.hide());

const setSecret = async (account: string, secret: string) => {
  await keytar.setPassword("com.projdocs.desktop", account, secret);
  getTrayWindow()?.webContents.send("auth:update"); // broadcast an update event
}

ipcMain.handle("auth:setSecret", async (_e, account: string, secret: string) => {
  await setSecret(account, secret);
  return true;
});
ipcMain.handle("auth:getSecret", async (_e, account: string) => {
  return keytar.getPassword("com.projdocs.desktop", account);
});
ipcMain.handle("auth:deleteSecret", async (_e, account: string) => {
  return keytar.deletePassword("com.projdocs.desktop", account);
});
ipcMain.handle("auth:list", async () => keytar.findCredentials("com.projdocs.desktop"));

// ---- deep link handler ----
async function handleDeepLink(link: string) {
  try {
    const url = new URL(link);
    if (url.protocol !== "projdocs:") return;
    switch (url.pathname) {
      case "/v1/auth/callback":
        const user = url.searchParams.get("user");
        const session = url.searchParams.get("session");
        if (user && session) {
          const u = JSON.parse(user)
          await setSecret(u.email || u.id, session);
        }
        break;
      default:
        console.warn(`[DEEP LINK]: "${url.pathname}" route unhandled`)
    }

    const w = getTrayWindow();
    if (w) {
      w.show();
      w.focus();
    }
  } catch (e) {
    console.error("Bad deep link:", link, e);
  }
}