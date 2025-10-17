import { app, IpcMain, shell } from "electron";
import { getTrayWindow } from "@workspace/desktop/electron/tray";
import * as Secrets from "@workspace/desktop/electron/secrets";



export const setupIpcMain = (ipcMain: IpcMain) => {

  ipcMain.handle("app:quit", () => app.quit());
  ipcMain.handle("app:open", async (_, url: string) => shell.openExternal(url));
  ipcMain.handle("app:hide", async () => getTrayWindow()?.hide());

  ipcMain.handle("auth:setSecret", async (_, secret: string) => await Secrets.set(secret));
  ipcMain.handle("auth:getSecret", async () => await Secrets.get());
  ipcMain.handle("auth:deleteSecret", async () => await Secrets.remove());
  ipcMain.handle("auth:list", async () => await Secrets.list());

};