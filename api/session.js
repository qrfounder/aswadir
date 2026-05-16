import { randomUUID } from "node:crypto";
import { getDb } from "./db.js";

const SESSION_DAYS = 30;
const COOKIE_NAME = "massar_session";

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export function createSession(userId) {
  const db = getDb();
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`,
  ).run(sessionId, userId, expiresAt);
  return { sessionId, expiresAt };
}

export function destroySession(sessionId) {
  const db = getDb();
  db.prepare(`DELETE FROM sessions WHERE id = ?`).run(sessionId);
}

export function getUserIdFromSession(sessionId) {
  if (!sessionId) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT user_id, expires_at FROM sessions WHERE id = ?`,
    )
    .get(sessionId);
  if (!row) return null;
  if (new Date(row.expires_at) < new Date()) {
    destroySession(sessionId);
    return null;
  }
  return row.user_id;
}

export function sessionCookieOptions(expiresAt) {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  };
}
