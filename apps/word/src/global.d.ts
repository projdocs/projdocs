import type { Office } from "office-js";



declare global {
  export type Action = (event: Office.AddinCommands.Event) => Promise<void>;
}

