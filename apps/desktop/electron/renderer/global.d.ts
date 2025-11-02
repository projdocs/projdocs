import { Events, IPCHandlers } from "@workspace/desktop/electron/src/ipc/types";



export {};

declare global {

  export type TypeofResult =
    | "undefined"
    | "boolean"
    | "number"
    | "bigint"
    | "string"
    | "symbol"
    | "function"
    | "object";

  interface Window extends IPCHandlers {
    app: IPCHandlers["app"] & {
      on: (event: Events, handler: () => unknown) => (() => void);
    }
  }
}