import type { Secrets } from "@workspace/desktop/electron/src/secrets/types";


export enum Events {
  AUTH_UPDATE = "auth:update",
}


export type IPCHandlers = {
  app: {
    quit: () => Promise<void>;
    open: (url: string) => Promise<boolean>;
    hide: () => Promise<void>;
  };
  secrets: {
    list: () => Promise<Secrets>;
    set: (secret: string) => Promise<void>;
    get: () => Promise<string | null>;
    delete: () => Promise<void>;
  }
}

// index access utility
export type Handler<T extends keyof IPCHandlers> = IPCHandlers[T];

export type ChannelMap = {
  [K in keyof IPCHandlers]: {
    [C in keyof IPCHandlers[K] & string]: `${K & string}:${C}`;
  };
};

// all valid "namespace:method" channel strings
export type Channels = {
  [K in keyof IPCHandlers]: `${K & string}:${keyof IPCHandlers[K] & string}`
}[keyof IPCHandlers];

// resolve a channel to its function type (e.g., "app:open" -> (url: string) => Promise<void>)
export type ChannelHandler<C extends Channels> =
  C extends `${infer NS}:${infer M}`
    ? NS extends keyof IPCHandlers
      ? M extends keyof IPCHandlers[NS]
        ? IPCHandlers[NS][M]
        : never
      : never
    : never;

// Args / Return helpers per channel
export type ChannelArgs<C extends Channels> = Parameters<ChannelHandler<C>>;
export type ChannelResult<C extends Channels> = ReturnType<ChannelHandler<C>>;
export type ChannelResultUnwrapped<C extends Channels> = Awaited<ChannelResult<C>>;

// Turn IPCHandlers into a union of { "ns:method": Fn } records
type ChannelRecords = {
  [NS in keyof IPCHandlers]: {
    [M in keyof IPCHandlers[NS] & string as `${NS & string}:${M}`]:
    IPCHandlers[NS][M];
  }
}[keyof IPCHandlers];

// Union -> intersection helper
type UnionToIntersection<U> =
  (U extends any ? (x: U) => any : never) extends (x: infer I) => any ? I : never;

// Optional: make mapped/intersection types easier to read in tooltips
type Simplify<T> = { [K in keyof T]: T[K] } & {};

// Final map: "app:open" -> (url: string) => Promise<void>, etc.
export type ChannelToHandler = Simplify<UnionToIntersection<ChannelRecords>>;

export type ChannelNamespace<C extends Channels> =
  C extends `${infer NS}:${string}` ? NS : never;

export type ChannelMethod<C extends Channels> =
  C extends `${string}:${infer M}` ? M : never;