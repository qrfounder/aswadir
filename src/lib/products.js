/**
 * Shared product catalog for Massar.
 * Used by both the landing pricing section and the checkout page.
 */
export const PRODUCTS = [
  {
    id: "task",
    priceId: "price_1TWfyIBlMHf0a8IXumiaZiJn",
    name: "متتبع المهام",
    subtitle: "نظّم مهامك اليومية بسهولة",
    originalPrice: 112,
    salePrice: 26,
    usdPrice: 6.99,
    discount: "75%",
    features: [
      "تتبّع مهامك اليومية والأسبوعية",
      "لوحة تحكم تشتغل لحالها",
      "يشتغل على Google Sheets و Excel",
      "تحديثات مجانية مدى الحياة",
    ],
    image: "/products/tasks.png",
    popular: false,
  },
  {
    id: "habit",
    priceId: "price_1TWfyIBlMHf0a8IXhqhlxL2I",
    name: "متتبع العادات",
    subtitle: "ابنِ عاداتك وخلّها تستمر",
    originalPrice: 112,
    salePrice: 26,
    usdPrice: 6.99,
    discount: "75%",
    features: [
      "تتبّع عاداتك يوم بيوم",
      "سلاسل ما تبي تقطعها",
      "نقاط ومؤشرات تحفّزك",
      "تحديثات مجانية مدى الحياة",
    ],
    image: "/products/habits.png",
    popular: false,
  },
  {
    id: "bundle",
    priceId: "price_1TWfyIBlMHf0a8IXu6QLr5Z4",
    name: "الباقة الكاملة ✦",
    subtitle: "متتبع العادات + متتبع المهام",
    originalPrice: 225,
    salePrice: 37,
    usdPrice: 9.99,
    discount: "85%",
    features: [
      "كل مميزات متتبع المهام",
      "كل مميزات متتبع العادات",
      "نظام النقاط والمكافآت المدمج",
      "لوحة تحكم موحّدة لكل شي",
      "يشتغل على Google Sheets و Excel",
      "دعم أولوية + تحديثات مدى الحياة",
    ],
    image: "/products/box.png",
    popular: true,
    badge: "الأكثر مبيعاً",
  },
];

export const getProduct = (id) =>
  PRODUCTS.find((p) => p.id === id) || PRODUCTS.find((p) => p.popular) || PRODUCTS[0];
