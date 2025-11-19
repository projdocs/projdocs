import db from "@workspace/admin/lib/db/index.ts";

export enum KvKeys {
  DB_INIT = "DB_INIT",
  JWT_SECRET = "SUPABASE_JWT_SECRET",
  PUBLIC_JWT = "SUPABASE_PUBLIC_JWT",
  PRIVATE_JWT = "SUPABASE_PRIVATE_JWT",
  PGSODIUM_ENCRYPTION_KEY = "SUPABASE_PGSODIUM_ENCRYPTION_KEY",
  REALTIME_BASE_KEY = "SUPABASE_REALTIME_BASE_KEY",
  POSTGRES_USE_SELF_HOSTED = "POSTGRES_USE_SELF_HOSTED",
  POSTGRES_HOST = "POSTGRES_HOST",
  POSTGRES_PORT = "POSTGRES_PORT",
  POSTGRES_USER = "POSTGRES_USER",
  POSTGRES_PASSWORD = "POSTGRES_PASSWORD",
  POSTGRES_DB = "POSTGRES_DB",
}

const setStmt = db.prepare(`
    INSERT INTO kv (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value;
`);
const getStmt = db.prepare<unknown[], { value: string | null }>(`
    SELECT value
    FROM kv
    WHERE key = ?;
`);
const deleteStmt = db.prepare(`
    DELETE
    FROM kv
    WHERE key = ?;
`);

type KV = {
  set: (key: KvKeys, value: string | null) => KV;
  get: (key: KvKeys) => string | null;
  delete: (key: KvKeys) => KV;
}

export const kv: KV = {
  set(key: KvKeys, value: string | null) {
    setStmt.run(key, value);
    return kv;
  },
  get(key: KvKeys): string | null {
    const row = getStmt.get(key);
    return row?.value ?? null;
  },
  delete(key: KvKeys) {
    deleteStmt.run(key);
    return kv;
  }
};