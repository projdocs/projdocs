import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { channelsMap } from "@workspace/desktop/electron/src/ipc";
import { ChannelToHandler, Events } from "@workspace/desktop/electron/src/ipc/types";



function handler<C extends keyof ChannelToHandler & string>(channel: C) {
  type Fn = ChannelToHandler[C];
  return ((...args: Parameters<Fn>) => ipcRenderer.invoke(channel, ...args)) as Fn;
}

// build `handlers` from channelsMap with types preserved
export const handlers = (() => {
  const built: any = {};
  for (const [ namespace, methods ] of Object.entries(channelsMap)) {
    const bucket: any = {};
    for (const [ method, channel ] of Object.entries(methods)) {
      bucket[method] = handler(channel as keyof ChannelToHandler & string);
    }
    built[namespace] = bucket;
  }
  return built as {
    [K in keyof typeof channelsMap]: {
      [C in keyof typeof channelsMap[K]]:
      ChannelToHandler[(typeof channelsMap[K])[C] & keyof ChannelToHandler & string];
    };
  };
})();

// expose to window (one namespace per key)
for (const ns of Object.keys(handlers) as Array<keyof typeof handlers>) {
  let space = handlers[ns];
  if (ns === "app") {
    space = {
      ...space,
      // @ts-ignore custom patch for app event listener
      on: (event: Events, listener: () => void) => {
        const sub = (_e: IpcRendererEvent) => listener();
        ipcRenderer.on(event as string, sub);
        return () => ipcRenderer.removeListener(event as string, sub);
      }
    };
  }
  contextBridge.exposeInMainWorld(ns, space);
}