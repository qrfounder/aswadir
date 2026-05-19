import { randomUUID } from "node:crypto";
import { getDb } from "./db.js";

const SESSION_DAYS = 7;
export const ADMIN_COOKIE_NAME = "massar_admin_session";

export function createAdminSession() {
  const db = getDb();
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    `INSERT INTO admin_sessions (id, expires_at) VALUES (?, ?)`,
  ).run(id, expiresAt);
  return { id, expiresAt };
}

export function destroyAdminSession(sessionId) {
  if (!sessionId) return;
  getDb().prepare(`DELETE FROM admin_sessions WHERE id = ?`).run(sessionId);
}

export function isAdminSessionValid(sessionId) {
  if (!sessionId) return false;
  const db = getDb();
  const row = db.prepare(`SELECT expires_at FROM admin_sessions WHERE id = ?`).get(sessionId);
  if (!row) return false;
  if (new Date(row.expires_at) < new Date()) {
    db.prepare(`DELETE FROM admin_sessions WHERE id = ?`).run(sessionId);
    return false;
  }
  return true;
}

export function adminSessionCookieOptions(expiresAt) {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  };
}
