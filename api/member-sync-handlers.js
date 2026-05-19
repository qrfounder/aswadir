import { getUserIdFromSession, getSessionCookieName } from "./session.js";
import {
  getDailyNote,
  getFullMemberSync,
  getTrackerPayload,
  listDailyNotes,
  setDailyNote,
  setTrackerPayload,
} from "./member-data-store.js";

const MAX_PAYLOAD_BYTES = 512_000;

function requireUser(req, res) {
  const userId = getUserIdFromSession(req.cookies?.[getSessionCookieName()]);
  if (!userId) {
    res.status(401).json({ error: "unauthenticated" });
    return null;
  }
  return userId;
}

function parsePayload(body) {
  if (body?.payload === undefined) return { error: "payload_required" };
  const json = JSON.stringify(body.payload);
  if (json.length > MAX_PAYLOAD_BYTES) return { error: "payload_too_large" };
  try {
    return { payload: body.payload };
  } catch {
    return { error: "invalid_payload" };
  }
}

export function handleMemberSyncGet(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    return res.status(200).json(getFullMemberSync(userId));
  } catch (err) {
    console.error("[member/sync GET]", err);
    return res.status(500).json({ error: "server_error" });
  }
}

export function handleMemberSyncPut(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;
  const namespace = String(req.params.namespace || "");
  const parsed = parsePayload(req.body);
  if (parsed.error) {
    return res.status(400).json({ error: parsed.error });
  }
  try {
    const updatedAt = setTrackerPayload(userId, namespace, parsed.payload);
    return res.status(200).json({ ok: true, namespace, updatedAt });
  } catch (err) {
    if (err.message === "invalid_namespace") {
      return res.status(400).json({ error: "invalid_namespace" });
    }
    console.error("[member/sync PUT]", err);
    return res.status(500).json({ error: "server_error" });
  }
}

export function handleDailyNoteGet(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;
  const date = String(req.query.date || new Date().toISOString().slice(0, 10));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "invalid_date" });
  }
  try {
    const row = getDailyNote(userId, date);
    return res.status(200).json({
      date,
      content: row?.content || "",
      updatedAt: row?.updatedAt || null,
    });
  } catch (err) {
    console.error("[member/daily-note GET]", err);
    return res.status(500).json({ error: "server_error" });
  }
}

export function handleDailyNotePut(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;
  const date = String(req.body?.date || "").trim();
  const content = String(req.body?.content ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "invalid_date" });
  }
  if (content.length > 20_000) {
    return res.status(400).json({ error: "content_too_large" });
  }
  try {
    const updatedAt = setDailyNote(userId, date, content);
    return res.status(200).json({ ok: true, date, updatedAt });
  } catch (err) {
    console.error("[member/daily-note PUT]", err);
    return res.status(500).json({ error: "server_error" });
  }
}

export function handleDailyNotesList(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;
  try {
    const notes = listDailyNotes(userId, 90);
    return res.status(200).json({ notes });
  } catch (err) {
    console.error("[member/daily-notes GET]", err);
    return res.status(500).json({ error: "server_error" });
  }
}

/** Used by tests / diagnostics */
export function handleMemberSyncNamespaceGet(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;
  const namespace = String(req.params.namespace || "");
  try {
    const row = getTrackerPayload(userId, namespace);
    if (!row) return res.status(200).json({ payload: null, updatedAt: null });
    return res.status(200).json(row);
  } catch (err) {
    console.error("[member/sync namespace GET]", err);
    return res.status(500).json({ error: "server_error" });
  }
}
