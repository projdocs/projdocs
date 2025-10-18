import type { Office } from "office-js";



declare global {
  export type Action = () => Promise<void>;
}

