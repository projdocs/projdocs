import { app, BrowserWindow, ipcMain, Menu } from "electron";
import { createTray, createTrayWindow, getTrayWindow } from "@workspace/desktop/electron/src/tray";
import { handleDeepLink, registerProtocol } from "@workspace/desktop/electron/src/protocol";
import { registerIpcHandlers } from "@workspace/desktop/electron/src/ipc/funcs";

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


// macOS delivers deep links to the running instance
app.on("open-url", async (event, url) => {
  event.preventDefault();
  await handleDeepLink(url);
});

// ---- app lifecycle ----
app.whenReady().then(async () => {
  // Register AFTER ready (more reliable on some setups)
  registerProtocol();

  // always start
  if (app.isPackaged) app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true,
    ...(process.platform === "win32"
      ? {
        path: process.execPath,
        args: [ "--hidden", "--autostart" ],
      }
      : {}),
  });

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
registerIpcHandlers(ipcMain);

