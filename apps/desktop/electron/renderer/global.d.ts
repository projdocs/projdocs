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
  interface Window {
    app: {
      quit: () => Promise<void>;
      open: (url: string) => Promise<void>;
      hide: () => Promise<void>;
    };
    api: {
      invoke<T = any>(channel: string, ...args: any[]): Promise<T>;
      send(channel: string, data?: unknown): void;
      on(channel: string, listener: (...args: any[]) => void): () => void;
      ping(): Promise<string>;
    };
    auth: {
      setSecret(account: string, secret: string): Promise<boolean>;
      getSecret(account: string): Promise<string | null>;
      deleteSecret(account: string): Promise<boolean>;
      list(): Promise<Array<{account: string; password: string}>>;
    };
  }
}