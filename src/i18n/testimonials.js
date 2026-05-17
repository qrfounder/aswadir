/**
 * Market-diverse testimonials per locale (en, ar, th).
 * Avatars: existing /public/avatars/*.png
 */
import { normalizeLocale } from "./constants.js";

/** @type {Record<string, Array<{ name: string; role: string; text: string; avatar: string; country: string }>>} */
export const TESTIMONIALS = {
  en: [
    {
      name: "James Mitchell",
      role: "Founder · Austin, USA",
      country: "US",
      avatar: "/avatars/ahmed.png",
      text: "I've tried every app and quit within weeks. Massar is different — 6 months without missing a day. My mornings are clear and I actually feel progress.",
    },
    {
      name: "Somsak P.",
      role: "Product lead · Bangkok, Thailand",
      country: "TH",
      avatar: "/avatars/omar.png",
      text: "When the streak grows in front of you, stopping feels impossible. Best habit system I've used for work and health.",
    },
    {
      name: "Fatima Zahra",
      role: "Consultant · Casablanca, Morocco",
      country: "MA",
      avatar: "/avatars/noura.png",
      text: "Simple, visual, and honest. I track habits and tasks in one place — finally something I keep opening every morning.",
    },
    {
      name: "Khalid Al-Shammari",
      role: "Marketing director · Dubai, UAE",
      country: "AE",
      avatar: "/avatars/khalid.png",
      text: "Not another app you forget. The dashboard updates itself — points, charts, momentum. It pulls you back in.",
    },
    {
      name: "Wei Lin",
      role: "Engineer · Singapore",
      country: "SG",
      avatar: "/avatars/faisal.png",
      text: "Five minutes each morning and my whole day is mapped. Productivity jumped more than I expected.",
    },
    {
      name: "Sarah Al-Mutairi",
      role: "Fitness coach · Riyadh, KSA",
      country: "SA",
      avatar: "/avatars/sara.png",
      text: "90+ days without skipping workouts or meal prep. Massar makes discipline feel like a game you want to win.",
    },
  ],
  ar: [
    {
      name: "محمد العمري",
      role: "رائد أعمال · الرياض، السعودية",
      country: "SA",
      avatar: "/avatars/mohammed.png",
      text: "جربت كل شي وما كملت. مع مسار صار لي 6 شهور بدون يوم فائت. يومي واضح وأحس بإنجاز حقيقي.",
    },
    {
      name: "خالد الشمري",
      role: "مدير تسويق · دبي، الإمارات",
      country: "AE",
      avatar: "/avatars/khalid.png",
      text: "لما السلسلة تطول قدامك مستحيل تبي توقف. النظام يحدّث نفسه — نقاط ورسوم ومؤشرات.",
    },
    {
      name: "فاطمة الزهراء",
      role: "استشارية · الدار البيضاء، المغرب",
      country: "MA",
      avatar: "/avatars/noura.png",
      text: "بسيط وواضح. أتابع عاداتي ومهامي من مكان واحد — أول شي أفتحه كل صباح.",
    },
    {
      name: "عبدالله القحطاني",
      role: "طالب ماجستير · الرياض",
      country: "SA",
      avatar: "/avatars/abdullah.png",
      text: "أحسن استثمار على نفسي. أهداف الدراسة والصحة — نتائج من أول أسبوع.",
    },
    {
      name: "سارة المطيري",
      role: "مدربة لياقة · الرياض",
      country: "SA",
      avatar: "/avatars/sara.png",
      text: "أكثر من 90 يوم بدون قطع تمرين أو أكل صحي. الأداة تناسب أي أحد يبي يغيّر عاداته.",
    },
    {
      name: "فيصل الدوسري",
      role: "مستشار مالي · جدة",
      country: "SA",
      avatar: "/avatars/faisal.png",
      text: "5 دقائق صباحاً وأعرف يومي كامل. إنتاجيتي ارتفعت بشكل ما توقعته.",
    },
  ],
  th: [
    {
      name: "สมศักดิ์ พงษ์วัฒนา",
      role: "ผู้ประกอบการ · กรุงเทพฯ",
      country: "TH",
      avatar: "/avatars/omar.png",
      text: "ลองแอปมาหลายตัวแล้วเลิกไปหมด แต่ Massar ทำให้ผมต่อเนื่องได้กว่า 6 เดือน เช้าชัด วันมีโฟกัส",
    },
    {
      name: "James Mitchell",
      role: "Founder · Austin, USA",
      country: "US",
      avatar: "/avatars/ahmed.png",
      text: "Streaks and visuals that actually motivate — I open it every single morning.",
    },
    {
      name: "خالد الشمري",
      role: "مدير تسويق · دبي",
      country: "AE",
      avatar: "/avatars/khalid.png",
      text: "لوحة واحدة للعادات والمهام — التحديثات التلقائية تخليك تكمل.",
    },
    {
      name: "Fatima Zahra",
      role: "Consultante · Casablanca",
      country: "MA",
      avatar: "/avatars/noura.png",
      text: "نظام بسيط وفعّال — أستخدمه للعمل والحياة الشخصية كل يوم.",
    },
    {
      name: "ปิยะดา ส.",
      role: "นักออกแบบ · เชียงใหม่",
      country: "TH",
      avatar: "/avatars/sara.png",
      text: "เห็นความก้าวหน้าทุกวัน กราฟและคะแนนทำให้อยากรักษา streak ต่อไป",
    },
    {
      name: "李伟",
      role: "工程师 · 深圳",
      country: "CN",
      avatar: "/avatars/faisal.png",
      text: "每天五分钟，整天更有条理。习惯+任务在一个面板里完成。",
    },
  ],
  zh: [
    {
      name: "李伟",
      role: "工程师 · 深圳",
      country: "CN",
      avatar: "/avatars/faisal.png",
      text: "试过很多应用都放弃了。Massar 让我连续坚持了六个月——早晨五分钟，整天清晰有目标。",
    },
    {
      name: "Sarah Chen",
      role: "产品经理 · 新加坡",
      country: "SG",
      avatar: "/avatars/sara.png",
      text: "连续打卡可视化做得非常好，看到进度就忍不住想继续。",
    },
    {
      name: "خالد الشمري",
      role: "营销总监 · 迪拜",
      country: "AE",
      avatar: "/avatars/khalid.png",
      text: "习惯和任务在一个会员面板里完成，自动统计省时省力。",
    },
    {
      name: "James Mitchell",
      role: "创业者 · 美国德州",
      country: "US",
      avatar: "/avatars/ahmed.png",
      text: "这是我用过最容易坚持的系统，数据会自动更新。",
    },
    {
      name: "สมศักดิ์ พ.",
      role: "创业者 · 曼谷",
      country: "TH",
      avatar: "/avatars/omar.png",
      text: "图表和积分让我每天都想打开——真正改变了我的一整天。",
    },
    {
      name: "Fatima Zahra",
      role: "顾问 · 卡萨布兰卡",
      country: "MA",
      avatar: "/avatars/noura.png",
      text: "简单、专业、可持续——适合真正想改变日常的人。",
    },
  ],
  fr: [
    {
      name: "Fatima Zahra",
      role: "Consultante · Casablanca, Maroc",
      country: "MA",
      avatar: "/avatars/noura.png",
      text: "J'ai tout essayé avant Massar. Six mois sans rupture — mes matinées sont claires et mes objectifs visibles.",
    },
    {
      name: "James Mitchell",
      role: "Fondateur · Austin, USA",
      country: "US",
      avatar: "/avatars/ahmed.png",
      text: "When the streak grows, you don't want to stop. The dashboard does the work for you.",
    },
    {
      name: "Khalid Al-Shammari",
      role: "Marketing · Dubaï, EAU",
      country: "AE",
      avatar: "/avatars/khalid.png",
      text: "Habitudes et tâches au même endroit — mises à jour automatiques, vraie motivation.",
    },
    {
      name: "สมศักดิ์ พงษ์วัฒนา",
      role: "Chef de produit · Bangkok",
      country: "TH",
      avatar: "/avatars/omar.png",
      text: "Cinq minutes le matin et ma journée est structurée. Simple et puissant.",
    },
    {
      name: "Mohammed Al-Amri",
      role: "Entrepreneur · Riyad, Arabie saoudite",
      country: "SA",
      avatar: "/avatars/mohammed.png",
      text: "Le meilleur investissement sur moi-même — résultats dès la première semaine.",
    },
    {
      name: "Sarah Al-Mutairi",
      role: "Coach fitness · Riyad",
      country: "SA",
      avatar: "/avatars/sara.png",
      text: "Plus de 90 jours sans manquer l'entraînement. Les graphiques maintiennent l'engagement.",
    },
  ],
};

/** @type {Record<string, Array<{ name: string; role: string; quote: string; avatar: string; gif: string }>>} */
export const VIDEO_CLIPS = {
  en: [
    {
      name: "James Mitchell",
      role: "Founder · USA",
      quote: "6 months without missing a day.",
      avatar: "/avatars/ahmed.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
    },
    {
      name: "Somsak P.",
      role: "Bangkok · Thailand",
      quote: "The streak keeps me going.",
      avatar: "/avatars/omar.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_2.gif?v=1765128013",
    },
    {
      name: "Khalid Al-Shammari",
      role: "Dubai · UAE",
      quote: "Impossible to quit once you see progress.",
      avatar: "/avatars/khalid.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_3.gif?v=1765128020",
    },
    {
      name: "Fatima Zahra",
      role: "Casablanca · Morocco",
      quote: "One dashboard for my whole life.",
      avatar: "/avatars/noura.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
    },
  ],
  ar: [
    {
      name: "محمد العمري",
      role: "رائد أعمال · السعودية",
      quote: "6 شهور بدون يوم فائت.",
      avatar: "/avatars/mohammed.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
    },
    {
      name: "خالد الشمري",
      role: "دبي · الإمارات",
      quote: "لما السلسلة تطول ما تقدر توقف.",
      avatar: "/avatars/khalid.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_2.gif?v=1765128013",
    },
    {
      name: "سارة المطيري",
      role: "الرياض · السعودية",
      quote: "أكثر من 90 يوم التزام.",
      avatar: "/avatars/sara.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_3.gif?v=1765128020",
    },
    {
      name: "فاطمة الزهراء",
      role: "الدار البيضاء · المغرب",
      quote: "لوحة واحدة لكل شي.",
      avatar: "/avatars/noura.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
    },
  ],
  th: [
    {
      name: "สมศักดิ์ พ.",
      role: "กรุงเทพฯ · ไทย",
      quote: "ต่อเนื่องกว่า 6 เดือน",
      avatar: "/avatars/omar.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
    },
    {
      name: "James Mitchell",
      role: "USA",
      quote: "Best morning ritual.",
      avatar: "/avatars/ahmed.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_2.gif?v=1765128013",
    },
    {
      name: "خالد الشمري",
      role: "دبي",
      quote: "شاشة واحدة لكل شي",
      avatar: "/avatars/khalid.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_3.gif?v=1765128020",
    },
    {
      name: "Fatima Zahra",
      role: "المغرب",
      quote: "بسيط وقوي",
      avatar: "/avatars/noura.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
    },
  ],
  zh: [
    {
      name: "李伟",
      role: "深圳 · 中国",
      quote: "连续六个月没有中断。",
      avatar: "/avatars/faisal.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
    },
    {
      name: "Sarah Chen",
      role: "新加坡",
      quote: "看到进度就想继续。",
      avatar: "/avatars/sara.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_2.gif?v=1765128013",
    },
    {
      name: "Khalid",
      role: "迪拜 · 阿联酋",
      quote: "一个面板搞定习惯与任务。",
      avatar: "/avatars/khalid.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_3.gif?v=1765128020",
    },
    {
      name: "James Mitchell",
      role: "美国",
      quote: "每天五分钟就够了。",
      avatar: "/avatars/ahmed.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
    },
  ],
  fr: [
    {
      name: "Fatima Zahra",
      role: "Casablanca · Maroc",
      quote: "Six mois sans interruption.",
      avatar: "/avatars/noura.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
    },
    {
      name: "James Mitchell",
      role: "USA",
      quote: "Ma routine du matin.",
      avatar: "/avatars/ahmed.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_2.gif?v=1765128013",
    },
    {
      name: "Khalid Al-Shammari",
      role: "Dubaï · EAU",
      quote: "Impossible d'arrêter la série.",
      avatar: "/avatars/khalid.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_3.gif?v=1765128020",
    },
    {
      name: "สมศักดิ์ พ.",
      role: "Bangkok",
      quote: "Simple et efficace.",
      avatar: "/avatars/omar.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
    },
  ],
};

export function getTestimonials(locale) {
  const code = normalizeLocale(locale);
  return TESTIMONIALS[code] || TESTIMONIALS.en;
}

export function getVideoClips(locale) {
  const code = normalizeLocale(locale);
  return VIDEO_CLIPS[code] || VIDEO_CLIPS.en;
}
