/**
 * Shared product catalog for Massar.
 * Display copy: useLocalizedProducts() + i18n (products.*).
 * Server amounts: api/catalog.js (keep sale prices in sync).
 */
export const PRODUCTS = [
  {
    id: "task",
    priceId: "price_1TXxEPAUbMU3KadXuDkMv590",
    name: "Task Tracker",
    subtitle: "Daily and weekly tasks in one place",
    originalPrice: 14.99,
    salePrice: 4.99,
    discount: "67%",
    billingLabel: "monthly",
    features: [
      "Daily and weekly task board",
      "Track progress inside Massar",
      "Reminders for what matters",
      "Cancel anytime from your dashboard",
    ],
    image: "/products/tasks.png",
    popular: false,
  },
  {
    id: "habit",
    priceId: "price_1TWfyIBlMHf0a8IXhqhlxL2I",
    name: "Habit Tracker",
    subtitle: "Build habits that stick",
    originalPrice: 14.99,
    salePrice: 4.99,
    discount: "67%",
    billingLabel: "monthly",
    features: [
      "Monthly habit grid and streaks",
      "Daily mood and energy sliders",
      "Points and momentum on wins",
      "Cancel anytime from your dashboard",
    ],
    image: "/products/habits.png",
    popular: false,
  },
  {
    id: "bundle",
    priceId: "price_1TXxETAUbMU3KadXYl2vFgih",
    name: "Full Bundle",
    subtitle: "Habits + tasks + unified life dashboard",
    originalPrice: 24.99,
    salePrice: 9.99,
    discount: "60%",
    billingLabel: "monthly",
    features: [
      "Everything in Task and Habit trackers",
      "One dashboard for your day",
      "Live progress analytics",
      "Member updates every month",
      "Priority support · cancel anytime",
    ],
    image: "/products/box.png",
    popular: true,
    badge: "Best value",
  },
];

export const getProduct = (id) =>
  PRODUCTS.find((p) => p.id === id) || PRODUCTS.find((p) => p.popular) || PRODUCTS[0];

export const BUNDLE_PRODUCT = getProduct("bundle");
