import { app, BrowserWindow, nativeImage, screen, Tray } from "electron";
import path from "node:path";
import { getAssetPath } from "./paths";



let tray: Tray | null = null;
let win: BrowserWindow | null = null;

export function getTrayWindow() { return win; }

export async function createTrayWindow() {
  if (win) return win;

  win = new BrowserWindow({
    width: 360,
    height: 480,
    useContentSize: true,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true, // nice popover feel
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (app.isPackaged) {
    await win.loadFile(path.join(__dirname, "renderer", "index.html"));
  } else {
    await win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  }

  // Hide when focus leaves
  win.on("blur", () => {
    if (!win?.webContents.isDevToolsOpened() && app.isPackaged) win?.hide();
  });

  return win;
}

export function createTray() {
  if (tray) return tray;

  const icon = nativeImage.createFromPath(getAssetPath("Tray-Template.png")).resize({ width: 20, height: 20 });
  try {
    icon.setTemplateImage(true);
  } catch (_) {}
  tray = new Tray(icon);
  tray.setToolTip("ProjDocs");

  const toggle = async () => {
    if (!win) await createTrayWindow();

    if (win!.isVisible()) {
      win!.hide();
      return;
    }
    positionWindowNearTray(tray!, win!);
    win!.show();
    win!.focus();
  };

  // Left click (and right click if you want same behavior)
  tray.on("click", toggle);
  tray.on("right-click", toggle);
  tray.on("double-click", toggle);

  return tray;
}

function positionWindowNearTray(tray: Tray, win: BrowserWindow) {
  const trayBounds = tray.getBounds();
  const winBounds = win.getBounds();
  const display = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y });

  let x: number;
  let y: number;

  if (process.platform === "darwin") {
    // macOS menu bar at top
    x = Math.round(trayBounds.x + trayBounds.width / 2 - winBounds.width / 2);
    y = Math.round(trayBounds.y + trayBounds.height + 6);
  } else {
    // Windows/Linux: heuristic for taskbar position
    const wa = display.workArea;
    const taskbarAtBottom = trayBounds.y > wa.y + wa.height / 2;

    x = Math.round(trayBounds.x + trayBounds.width - winBounds.width);
    y = taskbarAtBottom
      ? Math.round(trayBounds.y - winBounds.height - 6)
      : Math.round(trayBounds.y + trayBounds.height + 6);
  }

  // Keep in work area
  const wa = display.workArea;
  x = Math.min(Math.max(x, wa.x), wa.x + wa.width - winBounds.width);
  y = Math.min(Math.max(y, wa.y), wa.y + wa.height - winBounds.height);

  win.setPosition(x, y, false);
}