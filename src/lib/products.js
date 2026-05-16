/**
 * Shared product catalog for Massar.
 * Used by both the landing pricing section and the checkout page.
 * Server amounts: api/catalog.js (keep sale prices in sync).
 */
export const PRODUCTS = [
  {
    id: "task",
    priceId: "price_1TWfyIBlMHf0a8IXumiaZiJn",
    name: "متتبع المهام",
    subtitle: "نظّم مهامك اليومية بسهولة",
    originalPrice: 249,
    salePrice: 99,
    usdPrice: 26.99,
    discount: "60%",
    features: [
      "تتبّع مهامك اليومية والأسبوعية",
      "لوحة تحكم تشتغل لحالها",
      "يشتغل على Google Sheets و Excel",
      "وصول لمنطقة الأعضاء + تحديثات مدى الحياة",
    ],
    image: "/products/tasks.png",
    popular: false,
  },
  {
    id: "habit",
    priceId: "price_1TWfyIBlMHf0a8IXhqhlxL2I",
    name: "متتبع العادات",
    subtitle: "ابنِ عاداتك وخلّها تستمر",
    originalPrice: 249,
    salePrice: 99,
    usdPrice: 26.99,
    discount: "60%",
    features: [
      "تتبّع عاداتك يوم بيوم",
      "سلاسل ما تبي تقطعها",
      "نقاط ومؤشرات تحفّزك",
      "وصول لمنطقة الأعضاء + تحديثات مدى الحياة",
    ],
    image: "/products/habits.png",
    popular: false,
  },
  {
    id: "bundle",
    priceId: "price_1TWfyIBlMHf0a8IXu6QLr5Z4",
    name: "الباقة الكاملة ✦",
    subtitle: "متتبع العادات + متتبع المهام + منطقة الأعضاء",
    originalPrice: 449,
    salePrice: 149,
    usdPrice: 39.99,
    discount: "67%",
    features: [
      "كل مميزات متتبع المهام",
      "كل مميزات متتبع العادات",
      "نظام النقاط والمكافآت المدمج",
      "لوحة تحكم موحّدة داخل موقع مسار",
      "تحديثات ومحتوى تطوير ذاتي جديد يصلك هنا",
      "دعم أولوية + تحديثات مدى الحياة",
    ],
    image: "/products/box.png",
    popular: true,
    badge: "الأكثر مبيعاً",
  },
];

export const getProduct = (id) =>
  PRODUCTS.find((p) => p.id === id) || PRODUCTS.find((p) => p.popular) || PRODUCTS[0];

export const BUNDLE_PRODUCT = getProduct("bundle");
