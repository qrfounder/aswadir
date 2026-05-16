import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

let SqliteDatabase;

function loadSqliteDriver() {
  if (SqliteDatabase) return SqliteDatabase;
  try {
    SqliteDatabase = require("better-sqlite3");
    return SqliteDatabase;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`better-sqlite3 failed to load: ${message}`);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultPath = path.join(__dirname, "..", "data", "massar.db");

let db;
let initError;

export function getDbError() {
  if (db) return null;
  if (initError) return initError.message || String(initError);
  try {
    getDb();
    return null;
  } catch (err) {
    return err.message || String(err);
  }
}

export function getDb() {
  if (db) return db;
  if (initError) throw initError;
  const dbPath = process.env.DATABASE_PATH || defaultPath;
  try {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    const Database = loadSqliteDriver();
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
    return db;
  } catch (err) {
    initError = err;
    console.error(`[massar] SQLite failed at ${dbPath}:`, err);
    throw err;
  }
}

function migrate(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      whatsapp TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS purchases (
      payment_intent_id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'sar',
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      whatsapp TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      user_id TEXT REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      paid_at TEXT
    );

    CREATE TABLE IF NOT EXISTS entitlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_key TEXT NOT NULL,
      source_purchase_id TEXT REFERENCES purchases(payment_intent_id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, product_key)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases(user_id);
    CREATE INDEX IF NOT EXISTS idx_entitlements_user ON entitlements(user_id);
  `);
}
