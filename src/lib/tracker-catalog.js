/** Default tracker rows — aligned with deliverables/google-sheets (build-sheets.mjs) */

export const DEFAULT_HABITS = [
  { id: "wake", icon: "⏰", name: "الاستيقاظ مبكراً" },
  { id: "gym", icon: "💪", name: "النادي الرياضي" },
  { id: "read", icon: "📖", name: "القراءة" },
  { id: "plan", icon: "📋", name: "تخطيط اليوم (مسار)" },
  { id: "project", icon: "🎯", name: "عمل على المشروع" },
  { id: "no-alcohol", icon: "🚫", name: "بدون كحول" },
  { id: "social", icon: "📵", name: "ساعة سوشيال فقط" },
  { id: "journal", icon: "📝", name: "يومية الامتنان" },
  { id: "shower", icon: "🚿", name: "شاور بارد" },
  { id: "quran", icon: "🕌", name: "ورد قرآن" },
];

export const WEEK_DAYS_AR = [
  "الأحد",
  "الإثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

export const MENTAL_METRICS = [
  { id: "energy", icon: "⚡", label: "الطاقة" },
  { id: "mood", icon: "😊", label: "المزاج" },
  { id: "drive", icon: "🔥", label: "التحفيز" },
];

export const TASK_PRIORITIES = [
  { id: "high", icon: "🔴", label: "عاجل" },
  { id: "med", icon: "🟡", label: "متوسط" },
  { id: "low", icon: "🟢", label: "منخفض" },
];

export const PACK_META = {
  habit: {
    id: "habit",
    icon: "🌱",
    name: "متتبع العادات",
    tagline: "شبكة شهرية · سلاسل · نقاط تقدم",
    sheetLabel: "لوحة العادات",
  },
  task: {
    id: "task",
    icon: "✅",
    name: "متتبع المهام",
    tagline: "مخطط أسبوعي · أولويات · إنجاز يومي",
    sheetLabel: "المهام الأسبوعية",
  },
  bundle: {
    id: "bundle",
    icon: "✦",
    name: "الباقة الكاملة",
    tagline: "عادات + مهام · لوحة موحّدة",
    sheetLabel: "مسار الكامل",
  },
};

export function monthLabelAr(date = new Date()) {
  const months = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];
  return months[date.getMonth()];
}

export function daysInMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function monthStorageKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
