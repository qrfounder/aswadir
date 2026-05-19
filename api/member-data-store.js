import { getDb } from "./db.js";

const NAMESPACES = new Set(["habits", "tasks", "productivity"]);

function migrateMemberTables(database) {
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
  `);
}

/** @param {import('better-sqlite3').Database} database */
export function ensureMemberDataTables(database) {
  migrateMemberTables(database);
}

export function getTrackerPayload(userId, namespace) {
  if (!NAMESPACES.has(namespace)) return null;
  const db = getDb();
  ensureMemberDataTables(db);
  const row = db
    .prepare(
      `SELECT payload, updated_at AS updatedAt FROM member_tracker_data WHERE user_id = ? AND namespace = ?`,
    )
    .get(userId, namespace);
  if (!row) return null;
  try {
    return { payload: JSON.parse(row.payload), updatedAt: row.updatedAt };
  } catch {
    return null;
  }
}

export function setTrackerPayload(userId, namespace, payload) {
  if (!NAMESPACES.has(namespace)) {
    throw new Error("invalid_namespace");
  }
  const db = getDb();
  ensureMemberDataTables(db);
  const json = JSON.stringify(payload ?? {});
  db.prepare(
    `INSERT INTO member_tracker_data (user_id, namespace, payload, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, namespace) DO UPDATE SET
       payload = excluded.payload,
       updated_at = datetime('now')`,
  ).run(userId, namespace, json);
  const row = db
    .prepare(`SELECT updated_at AS updatedAt FROM member_tracker_data WHERE user_id = ? AND namespace = ?`)
    .get(userId, namespace);
  return row?.updatedAt || new Date().toISOString();
}

export function getDailyNote(userId, noteDate) {
  const db = getDb();
  ensureMemberDataTables(db);
  return db
    .prepare(
      `SELECT content, updated_at AS updatedAt FROM member_daily_notes WHERE user_id = ? AND note_date = ?`,
    )
    .get(userId, noteDate);
}

export function setDailyNote(userId, noteDate, content) {
  const db = getDb();
  ensureMemberDataTables(db);
  db.prepare(
    `INSERT INTO member_daily_notes (user_id, note_date, content, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id, note_date) DO UPDATE SET
       content = excluded.content,
       updated_at = datetime('now')`,
  ).run(userId, noteDate, String(content || ""));
  const row = db
    .prepare(`SELECT updated_at AS updatedAt FROM member_daily_notes WHERE user_id = ? AND note_date = ?`)
    .get(userId, noteDate);
  return row?.updatedAt || new Date().toISOString();
}

/** Recent daily notes for streak / calendar hints */
export function listDailyNotes(userId, limit = 60) {
  const db = getDb();
  ensureMemberDataTables(db);
  return db
    .prepare(
      `SELECT note_date AS date, content, updated_at AS updatedAt
       FROM member_daily_notes
       WHERE user_id = ? AND length(trim(content)) > 0
       ORDER BY note_date DESC
       LIMIT ?`,
    )
    .all(userId, limit);
}

export function getFullMemberSync(userId) {
  const db = getDb();
  ensureMemberDataTables(db);
  const rows = db
    .prepare(`SELECT namespace, payload, updated_at AS updatedAt FROM member_tracker_data WHERE user_id = ?`)
    .all(userId);

  const tracker = {};
  for (const row of rows) {
    if (!NAMESPACES.has(row.namespace)) continue;
    try {
      tracker[row.namespace] = { payload: JSON.parse(row.payload), updatedAt: row.updatedAt };
    } catch {
      /* skip corrupt row */
    }
  }

  const dailyNotes = listDailyNotes(userId, 90);
  return { tracker, dailyNotes };
}
