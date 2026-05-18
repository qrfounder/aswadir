/** Hero gallery slides: order is quick look → bundle → habits → tasks */

const GALLERY_SLIDES = [
  {
    key: "hero",
    labelKey: "hero.galleryQuick",
    paths: {
      en: "/products/en/hero.png",
      ar: "/products/ar/hero.png",
      th: "/products/th/hero.png",
    },
  },
  {
    key: "box",
    labelKey: "hero.galleryBundle",
    paths: {
      en: "/products/en/box.png",
      ar: "/products/ar/box.png",
      th: "/products/th/box.png",
    },
  },
  {
    key: "habits",
    labelKey: "hero.galleryHabits",
    paths: {
      en: "/products/en/habits.png",
      ar: "/products/ar/habits.png",
      th: "/products/th/habits.png",
    },
  },
  {
    key: "tasks",
    labelKey: "hero.galleryTasks",
    paths: {
      en: "/products/en/tasks.png",
      ar: "/products/ar/tasks.png",
      th: "/products/th/tasks.png",
    },
  },
];

function resolveLocale(locale) {
  const code = String(locale || "en").split("-")[0].toLowerCase();
  if (code === "ar" || code === "th" || code === "en") return code;
  return "en";
}

export function galleryImagePath(slideKey, locale) {
  const loc = resolveLocale(locale);
  const slide = GALLERY_SLIDES.find((s) => s.key === slideKey);
  if (!slide) return `/products/${slideKey}.png`;
  return slide.paths[loc] || slide.paths.en;
}

/** @param {string} locale @param {(key: string) => string} t */
export function getProductGallery(locale, t) {
  const loc = resolveLocale(locale);
  return GALLERY_SLIDES.map((slide) => ({
    key: slide.key,
    src: slide.paths[loc] || slide.paths.en,
    label: t(slide.labelKey),
  }));
}

export function getProductCardImage(productId, locale) {
  const map = {
    task: "tasks",
    habit: "habits",
    bundle: "box",
  };
  const key = map[productId];
  return key ? galleryImagePath(key, locale) : `/products/${productId}.png`;
}
