import bcrypt from "bcryptjs";
import {
  ADMIN_COOKIE_NAME,
  adminSessionCookieOptions,
  createAdminSession,
  destroyAdminSession,
  isAdminSessionValid,
} from "./admin-session.js";

function configuredUsername() {
  return String(process.env.ADMIN_USERNAME || "admin").trim();
}

function adminAuthConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH);
}

async function verifyAdminPassword(password) {
  const plain = process.env.ADMIN_PASSWORD;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    return bcrypt.compare(String(password || ""), hash);
  }
  if (plain) {
    return String(password || "") === plain;
  }
  return false;
}

export function requireAdmin(req, res, next) {
  const sessionId = req.cookies?.[ADMIN_COOKIE_NAME];
  if (!isAdminSessionValid(sessionId)) {
    return res.status(401).json({ error: "admin_unauthenticated" });
  }
  return next();
}

export async function handleAdminLogin(req, res) {
  if (!adminAuthConfigured()) {
    return res.status(503).json({
      error: "admin_not_configured",
      message: "Set ADMIN_USERNAME and ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH) in environment.",
    });
  }

  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");

  if (username !== configuredUsername()) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const valid = await verifyAdminPassword(password);
  if (!valid) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const { id, expiresAt } = createAdminSession();
  res.cookie(ADMIN_COOKIE_NAME, id, adminSessionCookieOptions(expiresAt));
  return res.status(200).json({ ok: true, username: configuredUsername() });
}

export function handleAdminLogout(req, res) {
  const sessionId = req.cookies?.[ADMIN_COOKIE_NAME];
  destroyAdminSession(sessionId);
  res.clearCookie(ADMIN_COOKIE_NAME, { path: "/" });
  return res.status(200).json({ ok: true });
}

export function handleAdminMe(req, res) {
  const sessionId = req.cookies?.[ADMIN_COOKIE_NAME];
  if (!isAdminSessionValid(sessionId)) {
    return res.status(401).json({ error: "admin_unauthenticated" });
  }
  return res.status(200).json({
    ok: true,
    username: configuredUsername(),
    siteUrl: process.env.SITE_URL || "",
  });
}
