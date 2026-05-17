#!/usr/bin/env python3
"""Wire sales components to i18n and sync locale files."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "src/i18n/locales"

def deep_merge(base, override):
    out = dict(base)
    for k, v in override.items():
        if isinstance(v, dict) and isinstance(out.get(k), dict) and not isinstance(v, list):
            out[k] = deep_merge(out[k], v)
        else:
            out[k] = v
    return out

# --- Locale: add Arabic for new extended keys ---
AR_EXT = {
    "common": {
        "back": "رجوع", "edit": "تعديل", "loading": "جاري التحميل…", "guest": "بك",
        "home": "العودة للرئيسية", "discount": "خصم", "ssl": "تشفير SSL",
        "freeTrialBadge": "يوم تجربة مجاني", "exampleName": "مثال: محمد العمري",
        "paymentChecking": "جاري التحقق من إعدادات الدفع…",
        "publishedAppOnly": "الدفع يشتغل من التطبيق المنشور فقط. افتح رابط الموقع الأصلي.",
        "feature": "الميزة", "reviewsCount": "+2,544 تقييم حقيقي", "ratingValue": "4.9/5",
        "full": "متوفر", "partial": "جزئي", "none": "غير متوفر",
        "comparisonLegend": "✓ = متوفر بقوة · − = يختلف · ✕ = غير متوفر عادة بنفس الشكل.",
    },
    "landing": {
        "beforeTitle": "هل هذا يصف", "beforeTitleHighlight": "واقعك الآن؟",
        "beforeSubtitle": "الفرق بين اللي يوصل واللي يتمنى هو النظام، مو الإرادة",
        "beforeCardTitle": "قبل نظام الانضباط", "afterCardTitle": "بعد نظام الانضباط",
        "beforeItems": [
            "تبدأ يومك وما تدري وش بتسوي", "تنسى مهامك وتتكدّس عليك الأشغال",
            "تبدأ عادة وتتركها بعد أسبوع", "تحس بتشتت وإرهاق كل يوم",
            "تضيّع وقت طويل بس تفكر وش تسوي",
        ],
        "afterItems": [
            "تصحى وأنت عارف بالضبط وش بتسوي", "مهامك مرتبة وتخلّصها يوم بيوم",
            "عاداتك تتراكم وتصير جزء من حياتك", "وضوح تام وتركيز عالي طول اليوم",
            "5 دقايق بس وتنظّم يومك كامل",
        ],
        "demoTitle": "شاهد النظام في", "demoTitleHighlight": "العمل",
        "demoSubtitle": "كل يوم تسجّل إنجازاتك وتشوف تقدمك يكبر قدام عينك",
        "demoAlt": "نظام الانضباط في العمل",
        "featuresTitle": "لماذا", "featuresTitleHighlight": "يعمل هذا النظام؟",
        "featuresSubtitle": "مبني على دراسات علمية في السلوك والتحفيز",
        "pricingTitle": "ابدأ", "pricingTitleHighlight": "نظامك اليوم",
        "pricingSubtitle": "عرض محدود، السعر هذا ما بيستمر طويل",
        "faqTitle": "أسئلة", "faqTitleHighlight": "شائعة",
        "finalTitle": "باقي عليك", "finalTitleHighlight": "قرار واحد",
        "finalTitle2": "وتتغير حياتك",
        "finalSubtitle": "كل شخص ناجح عنده نظام. هذا نظامك، جاهز خلال 60 ثانية.",
        "finalCta": "ابدأ الحين بس {{price}} ر.س",
        "finalNote": "ضمان استرداد كامل 21 يوم • دفع آمن • تحميل فوري",
        "stickyGuarantee": "ضمان 21 يوم", "stickySecure": "دفع آمن", "stickyInstant": "تحميل فوري",
        "stickyBundle": "الباقة الكاملة", "productAlt": "مسار · Massar — {{label}}",
    },
    "stats": {
        "eyebrow": "نتائج مجتمع مسار",
        "title": "نظام بسيط +", "titleHighlight": "إجراء يومي", "titleEnd": "= تقدم حقيقي",
        "subtitle": "الاستمرارية مو حظ — هي نظام. استطلاعات من مستخدمينا النشطين.",
        "items": [
            {"value": "92%", "label": "أبلغوا عن تركيز أوضح خلال 3 أيام"},
            {"value": "89%", "label": "بنوا عادات يومية أقوى خلال 14 يوم"},
            {"value": "95%", "label": "حسّوا بمساءلة أعلى من أي نظام سابق"},
        ],
    },
    "research": {
        "eyebrow": "ليش يشتغل؟",
        "title": "تقدر تسوّيه —", "titleHighlight": "بنظام مثبت",
        "p1": "أبحاث جامعة دوك تشير إلى أن حتى 45% من سلوكنا اليومي عادات تلقائية.",
        "p2": "دراسات في European Journal of Social Psychology تؤكد أن العادات تعتمد على التكرار المرئي والتغذية الراجعة الفورية.",
        "p3": "مسار يستخدم نفس المحفّزات النفسية عشان الاستمرارية تصير أسهل والنجاح أوضح.",
    },
    "trustPillars": {
        "items": [
            {"title": "تسجيل يومي بـ 5 دقايق", "desc": "ما تحتاج ساعات — علّم على عاداتك وشوف تقدمك."},
            {"title": "مبني على علم السلوك", "desc": "سلاسل مرئية + تغذية راجعة فورية = عادات تلتصق."},
            {"title": "ضمان استرداد 21 يوم", "desc": "جرّبه براحتك. مو مناسب؟ نرجع فلوسك كاملة."},
        ],
    },
    "gift": {"text": "يومياً: أول 100 عميل يحصلون على 10 قوالب إضافية هدية مع الطلب"},
    "trustBadges": {
        "items": [
            {"text": "ضمان استرداد 21 يوم", "sub": "بدون أي أسئلة"},
            {"text": "توصلك فوري", "sub": "خلال 60 ثانية"},
            {"text": "دفع آمن 100%", "sub": "تشفير SSL"},
            {"text": "اشتراك شهري", "sub": "إلغاء في أي وقت"},
        ],
    },
    "journey": {
        "eyebrow": "رحلة واقعية",
        "title": "وش يصير خلال", "titleHighlight": "أول شهر؟",
        "subtitle": "مو وعد سحري: مسار غالب المستخدمين لما يلتزمون بالتسجيل اليومي.",
        "weeks": [
            {"w": "الأسبوع 1", "title": "تثبيت الروتين", "desc": "5 دقايق يومياً، أول سلسلة تظهر. البساطة مو الكمال."},
            {"w": "الأسبوع 2", "title": "السلسلة تشتغل لك", "desc": "الدماغ يربط الإنجاز بالشكل واللون. التخطيط يصير أسهل."},
            {"w": "الأسبوع 3–4", "title": "ثبات أعلى", "desc": "الرسم البياني يوريك التقدّم. أصعب تكسر السلسلة من تخطّي يوم."},
        ],
    },
    "checkout": {"personalInfo": "بياناتك الشخصية", "checkingPayments": "جاري التحقق من إعدادات الدفع…", "whatsappPrefix": "+966"},
    "auth": {
        "password": "كلمة المرور", "claimPrompt": "دفعت وما أنشأت حساب؟ اربط طلبك",
        "claimLabel": "رقم عملية الدفع (pi_ أو dev_)", "invalidCredentials": "الإيميل أو كلمة المرور غير صحيحة.",
        "genericError": "صار خطأ. حاول مرة ثانية.", "backHome": "العودة للرئيسية",
    },
    "thankYou": {"orderConfirmedBanner": "تم تأكيد طلبك بنجاح، يعطيك العافية!"},
    "dashboard": {
        "products": {"habit": "متتبع العادات", "task": "متتبع المهام", "bundle": "الباقة الكاملة"},
        "noProducts": "لا توجد منتجات مفعّلة بعد.", "defaultName": "بك",
    },
    "tracker": {
        "overviewTab": "لوحة التقدم", "hubLabel": "مسار · التتبّع اليومي",
        "hubBundle": "الباقة الكاملة — عادات ومهام وتحليل حيّ في لوحة واحدة.",
        "hubTabs": "اختر التبويب للتبديل بين لوحة التقدم والمتتبعات.",
        "noSystem": "لا يوجد نظام مفعّل بعد. أكمل الشراء من الصفحة الرئيسية.",
        "ariaLabel": "متتبعات مسار", "tabsAria": "أقسام التتبع",
        "habits": {
            "wake": "الاستيقاظ مبكراً", "gym": "النادي الرياضي", "read": "القراءة",
            "plan": "تخطيط اليوم (مسار)", "project": "عمل على المشروع",
            "no-alcohol": "بدون كحول", "social": "ساعة سوشيال فقط",
            "journal": "يومية الامتنان", "shower": "شاور بارد", "quran": "ورد قرآن",
        },
        "weekDays": ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
        "metrics": {"energy": "الطاقة", "mood": "المزاج", "drive": "التحفيز"},
        "priorities": {"high": "عاجل", "med": "متوسط", "low": "منخفض"},
        "packs": {
            "habit": {"name": "متتبع العادات", "tagline": "شبكة شهرية · سلاسل · نقاط", "sheet": "لوحة العادات"},
            "task": {"name": "متتبع المهام", "tagline": "مخطط أسبوعي · أولويات", "sheet": "المهام الأسبوعية"},
            "bundle": {"name": "الباقة الكاملة", "tagline": "عادات + مهام · لوحة موحّدة", "sheet": "مسار الكامل"},
        },
    },
    "member": {
        "upgradeTitle": "افتح الباقة الكاملة", "upgradeBody": "عادات + مهام + تحليلات موحّدة في لوحة واحدة.",
        "upgradeCta": "الترقية للباقة الكاملة", "subscriptionActive": "نشط",
        "subscriptionTrial": "تجريبي", "subscriptionPastDue": "متأخر — حدّث طريقة الدفع",
        "subscriptionCanceled": "ملغى", "manageBilling": "إدارة الاشتراك والفواتير", "resubscribe": "إعادة الاشتراك",
        "subYourPlan": "اشتراكك: {{name}}", "subRenews": "التجديد: {{date}}",
        "subNoSubscription": "لا يوجد اشتراك مربوط بحسابك.", "subPortalError": "تعذّر فتح بوابة الفوترة.",
        "subCancelAtPeriodEnd": "ينتهي بنهاية الفترة الحالية", "subStatusUnpaid": "غير مدفوع",
        "analytics": {
            "chartHabits": "العادات %", "chartMental": "الحالة الذهنية %", "chartTaskDay": "إنجاز اليوم",
            "legendHabits": "نسبة العادات", "legendMental": "الحالة الذهنية",
            "lifeScore": "مؤشر الحياة", "lifeSublabel": "عادات · ذهني · مهام",
            "progressBoard": "لوحة التقدم", "progressHeadline": "تقدّمك يتحدّث مع كل إنجاز",
            "progressToday": "اليوم أنجزت {{done}} من {{total}} عادات",
            "progressStreak": " · أطول سلسلة {{count}} يوم",
            "progressStartHabits": "ابدأ بتسجيل عاداتك اليوم.",
            "progressWeekTasks": "أنجزت {{count}} مهمة هذا الأسبوع",
            "metricToday": "عادات اليوم", "metricMonth": "عادات الشهر", "metricMental": "الطاقة الذهنية",
            "metricStreak": "أطول سلسلة", "metricWeekTasks": "مهام الأسبوع",
            "ringToday": "اليوم", "ringMonth": "الشهر", "ringTasks": "المهام",
            "trendTitle": "اتجاه آخر {{count}} أيام",
            "habitMonthTitle": "إنجاز كل عادة — هذا الشهر",
            "habitMonthSub": "نسبة الأيام المنجزة لكل عادة",
            "taskDayTitle": "إنجاز المهام — حسب اليوم",
            "taskRemaining_one": "متبقي {{count}} مهمة — حدّث الحالة لرؤية التغيير فوراً",
            "taskRemaining_other": "متبقي {{count}} مهام — حدّث الحالة لرؤية التغيير فوراً",
            "noHabitsYet": "لا توجد عادات بعد.",
            "streakDays_one": "سلسلة {{count}} يوم", "streakDays_other": "سلسلة {{count}} أيام",
            "mentalToday": "مؤشرك الذهني اليوم",
            "mentalLiveHint": "يتحدّث فوراً عند تحريك المؤشرات بالأسفل",
            "mentalTitle": "الحالة الذهنية اليوم", "mentalNotRecorded": "لم تُسجّل بعد",
            "mentalEditHint": "لتعديل التقييم: تبويب <1>متتبع العادات</1> → قسم الحالة الذهنية",
        },
        "insight": {
            "dismiss": "إغلاق التنبيه",
            "legendaryTitle": "يوم أسطوري!", "legendaryBody": "أنجزت كل عاداتك اليوم — استمر!",
            "streakTitle": "سلسلة {{count}} أيام", "streakBody": "{{icon}} {{name}} — زخم قوي!",
            "habitLoggedTitle": "عادة مسجّلة", "habitLoggedBody": "{{name}} — إنجاز اليوم {{pct}}%",
            "habitOffTitle": "لا بأس", "habitOffBody": "غداً فرصة جديدة — ركّز على عادة واحدة",
            "mentalHighTitle": "طاقة عالية", "mentalHighBody": "مؤشرك الذهني {{score}}% — يوم مثالي للإنجاز",
            "mentalMidTitle": "توازن جيد", "mentalMidBody": "مؤشرك الذهني {{score}}% — حافظ على الوتيرة",
            "mentalLowTitle": "اعتنِ بنفسك", "mentalLowBody": "خفّف المهام وركّز على الراحة اليوم",
            "taskDoneTitle": "مهمة أنجزت", "taskDoneBody": "إنجاز الأسبوع {{pct}}% ({{done}}/{{total}})",
            "taskAddTitle": "مهمة جديدة", "taskAddBody": "خطّطها ونفّذها — كل إنجاز يقربك من هدفك",
        },
    },
    "checkoutDev": {
        "title": "السيرفر غير متصل — لا يمكن معاينة الدفع",
        "hint": "افتح الموقع من", "run": "بعد تشغيل:", "alt": "أو معاينة كاملة على منفذ واحد:",
        "then": "ثم",
    },
    "currency": {
        "label": "العملة",
        "chargeNote": "يُخصم من البطاقة بـ {{charge}}. الأسعار المعروضة بـ {{display}} حسب منطقتك.",
        "names": {
            "SAR": "ريال سعودي", "AED": "درهم إماراتي", "USD": "دولار أمريكي",
            "THB": "بات تايلندي", "MAD": "درهم مغربي", "KWD": "دينار كويتي",
            "QAR": "ريال قطري", "EGP": "جنيه مصري",
        },
    },
}

# Thai overrides (full namespaces - key marketing strings)
TH_OVERRIDES = json.loads(open(ROOT / "scripts/locale-packs/th.json", encoding="utf-8").read()) if (ROOT / "scripts/locale-packs/th.json").exists() else {}
ZH_OVERRIDES = json.loads(open(ROOT / "scripts/locale-packs/zh.json", encoding="utf-8").read()) if (ROOT / "scripts/locale-packs/zh.json").exists() else {}
FR_OVERRIDES = json.loads(open(ROOT / "scripts/locale-packs/fr.json", encoding="utf-8").read()) if (ROOT / "scripts/locale-packs/fr.json").exists() else {}

def sync_locales():
    en = json.loads((LOCALES / "en.json").read_text(encoding="utf-8"))
    ar_old = json.loads((LOCALES / "ar.json").read_text(encoding="utf-8"))
    ar = deep_merge(deep_merge(en, ar_old), AR_EXT)
    (LOCALES / "ar.json").write_text(json.dumps(ar, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for code, pack in [("th", TH_OVERRIDES)]:
        merged = deep_merge(en, pack) if pack else en
        (LOCALES / f"{code}.json").write_text(json.dumps(merged, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Locales synced")

if __name__ == "__main__":
    sync_locales()
