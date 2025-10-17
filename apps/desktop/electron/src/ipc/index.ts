import type { ChannelMap, Channels } from "./types";



export const channelsMap: ChannelMap = {
  app: {
    quit: "app:quit",
    open: "app:open",
    hide: "app:hide",
  },
  secrets: {
    list: "secrets:list",
    set: "secrets:set",
    get: "secrets:get",
    delete: "secrets:delete",
  }
};

export const channels: readonly Channels[] = (Object.keys(channelsMap) as Array<keyof typeof channelsMap>)
  .flatMap(ns => Object.values(channelsMap[ns]))
  .sort();