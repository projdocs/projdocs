import { IPCHandlers } from "@workspace/desktop/electron/src/ipc/types";



export {};

export type TypeofResult =
  | "undefined"
  | "boolean"
  | "number"
  | "bigint"
  | "string"
  | "symbol"
  | "function"
  | "object";

declare global {
  interface Window extends IPCHandlers {
  }
}