import { getSessionCookieName, getUserIdFromSession } from "./session.js";
import { getDb } from "./db.js";
import { getUserEntitlements, getUserPurchases } from "./purchases.js";

/** Placeholder member updates — replace with CMS or DB later */
const MEMBER_UPDATES = [
  {
    id: "welcome",
    title: "مرحباً في مسار",
    body: "حسابك جاهز. ابدأ من لوحة التحكم، وسنضيف هنا دورات وتحديثات وموارد جديدة لتحسين حياتك.",
    tag: "جديد",
    publishedAt: "2026-05-16",
  },
  {
    id: "habits-roadmap",
    title: "خارطة طريق العادات (قريباً)",
    body: "سلسلة قصيرة: كيف تبني 3 عادات أساسية في 21 يوم — داخل التطبيق، بدون ملفات خارجية.",
    tag: "قريباً",
    publishedAt: "2026-06-01",
  },
  {
    id: "productivity-pack",
    title: "حزمة الإنتاجية (قريباً)",
    body: "قوالب ومهام جاهزة لرواد الأعمال والطلاب — تُفتح تلقائياً لأصحاب الباقة الكاملة.",
    tag: "قريباً",
    publishedAt: "2026-07-01",
  },
];

export function handleDashboard(req, res) {
  const sessionId = req.cookies?.[getSessionCookieName()];
  const userId = getUserIdFromSession(sessionId);
  if (!userId) {
    return res.status(401).json({ error: "unauthenticated" });
  }

  const db = getDb();
  const user = db.prepare(`SELECT id, email, name, whatsapp, created_at FROM users WHERE id = ?`).get(userId);

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      whatsapp: user.whatsapp,
      createdAt: user.created_at,
    },
    entitlements: getUserEntitlements(userId),
    purchases: getUserPurchases(userId),
    updates: MEMBER_UPDATES,
  });
}
