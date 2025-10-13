import { BrowserWindow, nativeImage, screen, Tray } from "electron";
import path from "node:path";



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
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (process.env.NODE_ENV === "development") {
    await win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    await win.loadFile(path.join(__dirname, "renderer", "index.html"));
  }

  // Hide when focus leaves
  win.on("blur", () => {
    if (!win?.webContents.isDevToolsOpened() && process.env.NODE_ENV !== "development") win?.hide();
  });

  return win;
}

export function createTray() {
  if (tray) return tray;

  const icon = nativeImage.createFromDataURL("data:image/png;base64,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");
  if (process.platform === "darwin") icon.setTemplateImage(true);
  tray = new Tray(icon.resize({ width: 20, height: 20 }));
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