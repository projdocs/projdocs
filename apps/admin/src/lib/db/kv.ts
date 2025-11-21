import db from "@workspace/admin/lib/db/index.ts";
import { KvKeys } from "@workspace/admin/lib/db/enum.ts";

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