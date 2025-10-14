import { contextBridge, ipcRenderer } from "electron";



contextBridge.exposeInMainWorld("api", {

  // Request/response IPC (returns a Promise)
  invoke: <T = any>(channel: string, ...args: any[]) =>
    ipcRenderer.invoke(channel, ...args) as Promise<T>,

  // Fire-and-forget
  send: (channel: string, data?: unknown) => ipcRenderer.send(channel, data),

  // Subscribe to push events from main (returns unsubscribe fn)
  on: (channel: string, listener: (...args: any[]) => void) => {
    const sub = (_e: Electron.IpcRendererEvent, ...args: any[]) => listener(...args);
    ipcRenderer.on(channel, sub);
    return () => ipcRenderer.removeListener(channel, sub);
  },

  // Example helper
  ping: () => ipcRenderer.invoke("ping"),
});

contextBridge.exposeInMainWorld("app", {
  quit: () => ipcRenderer.invoke("app:quit") as Promise<void>,
  open: (url: string) => ipcRenderer.invoke("app:open", url) as Promise<void>,
  hide: () => ipcRenderer.invoke("app:hide") as Promise<void>,
});

contextBridge.exposeInMainWorld("auth", {
  setSecret: (account: string, secret: string) =>
    ipcRenderer.invoke("auth:setSecret", account, secret) as Promise<void>,
  getSecret: (account: string) =>
    ipcRenderer.invoke("auth:getSecret", account) as Promise<string | null>,
  deleteSecret: (account: string) =>
    ipcRenderer.invoke("auth:deleteSecret", account) as Promise<boolean>,
  list: () => ipcRenderer.invoke("auth:list") as Promise<Array<{account: string; password: string}>>,
});