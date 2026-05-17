/**
 * Shared product catalog for Massar.
 * Used by both the landing pricing section and the checkout page.
 * Server amounts: api/catalog.js (keep sale prices in sync).
 * Global pricing: $4.99/mo singles · $9.99/mo bundle (USD).
 */
export const PRODUCTS = [
  {
    id: "task",
    priceId: "price_1TXxEPAUbMU3KadXuDkMv590",
    name: "متتبع المهام",
    subtitle: "نظّم مهامك اليومية بسهولة",
    originalPrice: 14.99,
    salePrice: 4.99,
    discount: "67%",
    billingLabel: "شهرياً",
    features: [
      "لوحة مهام يومية وأسبوعية تفتح كل صباح",
      "تتبّع تقدّمك من مكان واحد داخل مسار",
      "تنبيهات وتحفيز لإنجاز المهام المهمة",
      "إلغاء الاشتراك في أي وقت من لوحة التحكم",
    ],
    image: "/products/tasks.png",
    popular: false,
  },
  {
    id: "habit",
    priceId: "price_1TWfyIBlMHf0a8IXhqhlxL2I",
    name: "متتبع العادات",
    subtitle: "ابنِ عاداتك وخلّها تستمر",
    originalPrice: 14.99,
    salePrice: 4.99,
    discount: "67%",
    billingLabel: "شهرياً",
    features: [
      "شبكة عادات شهرية + سلاسل تحفّزك",
      "مؤشرات مزاج وطاقة يومية",
      "نقاط ومكافآت عند الالتزام",
      "إلغاء الاشتراك في أي وقت من لوحة التحكم",
    ],
    image: "/products/habits.png",
    popular: false,
  },
  {
    id: "bundle",
    priceId: "price_1TXxETAUbMU3KadXYl2vFgih",
    name: "الباقة الكاملة ✦",
    subtitle: "عادات + مهام + لوحة حياة موحّدة",
    originalPrice: 24.99,
    salePrice: 9.99,
    discount: "60%",
    billingLabel: "شهرياً",
    features: [
      "كل مميزات متتبع المهام والعادات",
      "لوحة تحكم يومية — تطبيقك لإدارة حياتك",
      "تحليلات تقدّم فورية وتحفيز يومي",
      "محتوى وتحديثات أعضاء جديدة كل شهر",
      "دعم أولوية + إلغاء في أي وقت",
    ],
    image: "/products/box.png",
    popular: true,
    badge: "الأكثر مبيعاً",
  },
];

export const getProduct = (id) =>
  PRODUCTS.find((p) => p.id === id) || PRODUCTS.find((p) => p.popular) || PRODUCTS[0];

export const BUNDLE_PRODUCT = getProduct("bundle");
