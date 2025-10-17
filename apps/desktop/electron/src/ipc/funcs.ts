import type { IpcMain } from "electron";
import { app, shell, } from "electron";
import { getTrayWindow } from "@workspace/desktop/electron/src/tray";
import type { ChannelArgs, ChannelHandler, ChannelResult, Channels } from "@workspace/desktop/electron/src/ipc/types";
import { Secrets } from "@workspace/desktop/electron/src/secrets";



const handle = <C extends Channels>(
  ipcMain: IpcMain,
  channel: C,
  fn: (...args: ChannelArgs<C>) => ChannelResult<C>
) => {
  ipcMain.handle(channel, async (_e, ...args) => {
    const res = await fn(...(args as ChannelArgs<C>));
    try {
      // Throws if res is not cloneable
      structuredClone(res as any);
    } catch (e) {
      console.error(`[ipc:${channel}] return not cloneable:`, res, e);
      throw new Error(`Non-cloneable return from ${channel}`);
    }
    return res;
  });
};

const handlers: {
  [K in Channels]: undefined | ChannelHandler<K>;
} = {
  "app:quit": async () => app.quit(),
  "app:open": async (url: string) => shell.openExternal(url),
  "app:hide": async () => getTrayWindow()?.hide(),
  "secrets:list": async () => await Secrets.list(),
  "secrets:set": async (secret: string) => await Secrets.set(secret),
  "secrets:get": async () => await Secrets.get(),
  "secrets:delete": async () => await Secrets.remove()
};

export const registerIpcHandlers = (ipcMain: IpcMain) => {

  const entries = <T extends Record<string, any>>(obj: T) =>
    Object.entries(obj) as { [K in keyof T]: [ K, T[K] ] }[keyof T][];

  for (const [ channel, fn ] of entries(handlers))
    if (fn !== undefined) handle(ipcMain, channel, fn as any);
};