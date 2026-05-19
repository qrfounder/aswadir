import { client } from "@/api/client";

const META_KEY = (userId) => `massar_sync_meta_${userId}`;
const PUSH_DEBOUNCE_MS = 600;

/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const pushTimers = new Map();

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function loadMeta(userId) {
  return safeParse(localStorage.getItem(META_KEY(userId)), {});
}

function saveMeta(userId, meta) {
  localStorage.setItem(META_KEY(userId), JSON.stringify(meta));
}

function lsKey(userId, namespace) {
  if (namespace === "habits") return `massar_tracker_${userId}_habits`;
  if (namespace === "tasks") return `massar_tracker_${userId}_tasks`;
  if (namespace === "productivity") return `massar_productivity_hub_${userId}`;
  return null;
}

function hasLocalPayload(userId, namespace) {
  const key = lsKey(userId, namespace);
  if (!key) return false;
  const raw = localStorage.getItem(key);
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    if (namespace === "habits") return Boolean(data?.habits?.length || Object.keys(data?.months || {}).length);
    if (namespace === "tasks") return Boolean(Object.keys(data?.weeks || {}).length);
    if (namespace === "productivity") {
      return Boolean(
        data?.todos?.length ||
          data?.weeklyReview ||
          data?.gratitude?.some((g) => g?.trim?.()) ||
          data?.goals?.some((g) => g?.title),
      );
    }
  } catch {
    return false;
  }
  return false;
}

function applyServerPayload(userId, namespace, payload, updatedAt) {
  const key = lsKey(userId, namespace);
  if (!key || payload == null) return;
  localStorage.setItem(key, JSON.stringify(payload));
  const meta = loadMeta(userId);
  meta[namespace] = updatedAt;
  saveMeta(userId, meta);
  window.dispatchEvent(new CustomEvent("massar:data-synced", { detail: { namespace } }));
}

/**
 * Pull cloud data on login — server wins when newer; push local when server empty.
 * @returns {Promise<'ok'|'offline'|'error'>}
 */
export async function hydrateMemberDataFromServer(userId) {
  if (!userId) return "error";
  try {
    const remote = await client.member.syncAll();
    const meta = loadMeta(userId);
    const namespaces = ["habits", "tasks", "productivity"];

    for (const ns of namespaces) {
      const remoteRow = remote.tracker?.[ns];
      const remotePayload = remoteRow?.payload;
      const remoteAt = remoteRow?.updatedAt;
      const localAt = meta[ns];
      const localHas = hasLocalPayload(userId, ns);
      const remoteHas =
        remotePayload &&
        (ns === "habits"
          ? Object.keys(remotePayload.months || {}).length || remotePayload.habits?.length
          : ns === "tasks"
            ? Object.keys(remotePayload.weeks || {}).length
            : true);

      if (remoteHas && remoteAt && (!localAt || remoteAt >= localAt)) {
        applyServerPayload(userId, ns, remotePayload, remoteAt);
      } else if (localHas && !remoteHas) {
        const key = lsKey(userId, ns);
        const payload = safeParse(localStorage.getItem(key), null);
        if (payload) {
          const updatedAt = await client.member.pushSync(ns, payload);
          meta[ns] = updatedAt;
        }
      }
    }

    saveMeta(userId, meta);

    if (Array.isArray(remote.dailyNotes)) {
      const notesKey = `massar_daily_notes_${userId}`;
      const existing = safeParse(localStorage.getItem(notesKey), {});
      for (const note of remote.dailyNotes) {
        if (!note?.date) continue;
        const remoteContent = String(note.content || "");
        const localContent = existing[note.date]?.content ?? "";
        if (!localContent || (note.updatedAt && note.updatedAt >= (existing[note.date]?.updatedAt || ""))) {
          existing[note.date] = { content: remoteContent, updatedAt: note.updatedAt };
        }
      }
      localStorage.setItem(notesKey, JSON.stringify(existing));
    }

    window.dispatchEvent(new CustomEvent("massar:sync-complete"));
    return "ok";
  } catch {
    return "offline";
  }
}

export function scheduleTrackerPush(userId, namespace, payload) {
  if (!userId || !namespace) return;
  const timerKey = `${userId}:${namespace}`;
  const existing = pushTimers.get(timerKey);
  if (existing) clearTimeout(existing);

  pushTimers.set(
    timerKey,
    setTimeout(async () => {
      pushTimers.delete(timerKey);
      try {
        const updatedAt = await client.member.pushSync(namespace, payload);
        const meta = loadMeta(userId);
        meta[namespace] = updatedAt;
        saveMeta(userId, meta);
        window.dispatchEvent(new CustomEvent("massar:sync-saved", { detail: { namespace } }));
      } catch {
        window.dispatchEvent(new CustomEvent("massar:sync-error", { detail: { namespace } }));
      }
    }, PUSH_DEBOUNCE_MS),
  );
}

const notesKey = (userId) => `massar_daily_notes_${userId}`;

export function loadLocalDailyNote(userId, date) {
  const all = safeParse(localStorage.getItem(notesKey(userId)), {});
  return all[date]?.content ?? "";
}

export function saveLocalDailyNote(userId, date, content) {
  const all = safeParse(localStorage.getItem(notesKey(userId)), {});
  all[date] = { content, updatedAt: new Date().toISOString() };
  localStorage.setItem(notesKey(userId), JSON.stringify(all));
}

let notePushTimer;

export function scheduleDailyNotePush(userId, date, content) {
  saveLocalDailyNote(userId, date, content);
  if (notePushTimer) clearTimeout(notePushTimer);
  notePushTimer = setTimeout(async () => {
    try {
      await client.member.saveDailyNote(date, content);
      window.dispatchEvent(new CustomEvent("massar:sync-saved", { detail: { namespace: "dailyNote" } }));
    } catch {
      window.dispatchEvent(new CustomEvent("massar:sync-error", { detail: { namespace: "dailyNote" } }));
    }
  }, PUSH_DEBOUNCE_MS);
}

export async function loadDailyNoteForDate(userId, date) {
  const local = loadLocalDailyNote(userId, date);
  try {
    const remote = await client.member.getDailyNote(date);
    if (remote?.updatedAt) {
      const all = safeParse(localStorage.getItem(notesKey(userId)), {});
      const localRow = all[date];
      if (!localRow?.updatedAt || remote.updatedAt >= localRow.updatedAt) {
        saveLocalDailyNote(userId, date, remote.content || "");
        return remote.content || "";
      }
    }
  } catch {
    /* offline */
  }
  return local;
}
