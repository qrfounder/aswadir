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
  const rawPath = process.env.DATABASE_PATH || defaultPath;
  const dbPath = path.isAbsolute(rawPath)
    ? rawPath
    : path.resolve(__dirname, "..", rawPath.replace(/^\.\//, ""));
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

    CREATE TABLE IF NOT EXISTS subscriptions (
      stripe_subscription_id TEXT PRIMARY KEY,
      stripe_customer_id TEXT NOT NULL,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      product_id TEXT NOT NULL,
      status TEXT NOT NULL,
      current_period_end TEXT,
      cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
      checkout_session_id TEXT UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(stripe_customer_id);
  `);

  ensureColumn(database, "users", "stripe_customer_id", "TEXT");
  ensureColumn(database, "purchases", "checkout_session_id", "TEXT");
  ensureColumn(database, "purchases", "subscription_id", "TEXT");
  ensureColumn(database, "purchases", "pending_password_hash", "TEXT");

  database.exec(`
    CREATE TABLE IF NOT EXISTS member_tracker_data (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      namespace TEXT NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, namespace)
    );

    CREATE TABLE IF NOT EXISTS member_daily_notes (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      note_date TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, note_date)
    );

    CREATE INDEX IF NOT EXISTS idx_member_daily_notes_user_date
      ON member_daily_notes(user_id, note_date DESC);

    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      session_id TEXT,
      user_id TEXT,
      path TEXT,
      product_id TEXT,
      locale TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT,
      referrer TEXT,
      country TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function ensureColumn(database, table, column, typeSql) {
  const cols = database.prepare(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeSql}`);
  }
}
