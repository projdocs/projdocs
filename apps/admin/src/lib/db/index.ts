import BetterSqlite3 from "better-sqlite3";
import * as path from "node:path";
import * as fs from "node:fs";
import * as os from "node:os";

const adminDir = path.join(os.homedir(), ".projdocs", "admin");
fs.mkdirSync(adminDir, { recursive: true });

const dbPath = path.join(adminDir, "db.sqlite");

// Open database
const db: BetterSqlite3.Database  = new BetterSqlite3(dbPath);

// Optional / recommended SQLite pragmas
db.pragma("journal_mode = WAL");
db.pragma("synchronous = FULL");


db.exec(`
    CREATE TABLE IF NOT EXISTS kv
    (
        key   TEXT PRIMARY KEY NOT NULL,
        value TEXT             NULL
    );
`);

export default db;