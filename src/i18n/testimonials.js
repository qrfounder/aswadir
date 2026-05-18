/**
 * 15 market-specific reviews (SA · AE · US · TH) per locale — pain-led copy for habit/productivity ICP.
 * Avatars are fixed per review id (gender + region); Gulf portraits are local assets.
 */
import { normalizeLocale } from "./constants.js";

/** One portrait per reviewer id — stable across en / ar / th */
export const REVIEW_AVATARS = {
  r1: "/avatars/noura.png",
  r2: "/avatars/omar.png",
  r3: "https://i.pravatar.cc/256?img=47",
  r4: "https://i.pravatar.cc/256?img=68",
  r5: "/avatars/abdullah.png",
  r6: "https://i.pravatar.cc/256?img=44",
  r7: "https://i.pravatar.cc/256?img=52",
  r8: "https://i.pravatar.cc/256?img=45",
  r9: "/avatars/mohammed.png",
  r10: "https://i.pravatar.cc/256?img=49",
  r11: "/avatars/ahmed.png",
  r12: "https://i.pravatar.cc/256?img=59",
  r13: "/avatars/sara.png",
  r14: "/avatars/faisal.png",
  r15: "https://i.pravatar.cc/256?img=32",
};

function attachAvatars(rows) {
  return rows.map((r) => ({ ...r, avatar: REVIEW_AVATARS[r.id] }));
}

/** @typedef {{ id: string; name: string; role: string; text: string; avatar: string; country: 'SA'|'AE'|'US'|'TH'; date: string }} T */

/** @type {T[]} */
const EN = [
  {
    id: "r1",
    country: "SA",
    name: "Noura Al-Qahtani",
    role: "HR lead · Riyadh",
    date: "Mar 2026",
    text: "I was ashamed every Sunday night — another week I promised I'd 'get organized' and didn't. Seeing my streak on Massar broke that loop. I'm not guessing anymore; I'm proving it to myself daily.",
  },
  {
    id: "r2",
    country: "AE",
    name: "Omar Haddad",
    role: "Operations · Dubai",
    date: "Feb 2026",
    text: "Between clients and kids I lived in constant fear I'd drop a ball. One dashboard for habits + tasks stopped the mental juggling. I finally close my laptop without that sick 'what did I forget?' feeling.",
  },
  {
    id: "r3",
    country: "US",
    name: "Emily Carter",
    role: "Product designer · Austin, TX",
    date: "Jan 2026",
    text: "I thought my brain was wired for chaos; turns out I just had no system. Five minutes in Massar each morning replaced the shame spiral. My manager even commented I'm 'suddenly always ahead' — that's the real ROI.",
  },
  {
    id: "r4",
    country: "TH",
    name: "Somsak Wichai",
    role: "Startup founder · Bangkok",
    date: "Mar 2026",
    text: "I felt guilty wasting family dinners on my phone 'working' but getting nothing done. Now I log wins fast, put the phone down, and actually show up. The fear of being the dad who never followed through is fading.",
  },
  {
    id: "r5",
    country: "SA",
    name: "Abdullah Al-Harbi",
    role: "Engineer · Dammam",
    date: "Feb 2026",
    text: "Burnout made me cynical about any new app. Massar didn't ask for a life overhaul — it made consistency visible. That visibility turned discipline from punishment into something I want to protect.",
  },
  {
    id: "r6",
    country: "AE",
    name: "Layla Mansour",
    role: "Marketing · Abu Dhabi",
    date: "Jan 2026",
    text: "I compared myself to colleagues who seemed effortlessly on top. The truth was they had rituals I didn't. Massar gave me those rituals without the cringe corporate planner vibe — private, fast, mine.",
  },
  {
    id: "r7",
    country: "US",
    name: "Jordan Blake",
    role: "Sales · New York",
    date: "Dec 2025",
    text: "Turning 34 hit different — fear I'd be the guy full of ideas and zero follow-through. Streaks and points sound silly until they become proof you're not lying to yourself. That proof changed how I show up at work.",
  },
  {
    id: "r8",
    country: "TH",
    name: "Pimchanok Saelim",
    role: "Teacher · Chiang Mai",
    date: "Feb 2026",
    text: "I used to hide my to-do lists because they shamed me. One place for habits and tasks meant I stopped restarting from zero every Monday. The relief is physical — shoulders unclench when the plan is honest.",
  },
  {
    id: "r9",
    country: "SA",
    name: "Mohammed Al-Amri",
    role: "Entrepreneur · Jeddah",
    date: "Mar 2026",
    text: "Clients don't see your inner chaos — they see missed deadlines. Massar became my pre-flight checklist for life: health, deep work, family blocks. I stopped performing 'busy' and started shipping calm.",
  },
  {
    id: "r10",
    country: "AE",
    name: "Noora Al-Ketbi",
    role: "Parent + consultant · Sharjah",
    date: "Jan 2026",
    text: "School runs + deliverables left me in tears some nights — not sad, just overwhelmed. Breaking the day into tiny wins I can tick off saved my sanity. I wish I'd found this before I convinced myself I was 'bad at balance.'",
  },
  {
    id: "r11",
    country: "US",
    name: "Alex Rivera",
    role: "Software engineer · Seattle",
    date: "Nov 2025",
    text: "I had the gym membership shame — paying for discipline I never used. Massar flipped it: cheap enough to try, structured enough to stick. First time in years I feel proud of a Tuesday, not just a New Year.",
  },
  {
    id: "r12",
    country: "TH",
    name: "Anan Thongdee",
    role: "Logistics manager · Phuket",
    date: "Dec 2025",
    text: "Health anxiety was eating me — lots of plans, zero follow-through. When habits, workouts, and deep-work blocks finally lived in one rhythm on Massar, the fear became something I could act on instead of something I ruminated on. My wife noticed before I did.",
  },
  {
    id: "r13",
    country: "SA",
    name: "Sara Al-Mutairi",
    role: "Fitness coach · Riyadh",
    date: "Mar 2026",
    text: "I sell discipline for a living but even coaches burn out. Massar keeps my own habits non-negotiable without bragging about them online. It's the quiet accountability high performers actually need.",
  },
  {
    id: "r14",
    country: "AE",
    name: "Hassan Al-Zaabi",
    role: "Finance · Dubai",
    date: "Feb 2026",
    text: "I was angry at money I'd wasted on apps I abandoned. This one earned its keep in week one because it respects time — open, log, done. The emotional win is bigger than the feature list: I trust myself again.",
  },
  {
    id: "r15",
    country: "US",
    name: "Taylor Brooks",
    role: "Grad student · Chicago",
    date: "Jan 2026",
    text: "Imposter syndrome + thesis dread is a brutal combo. Massar turned 'survive the semester' into daily reps I could win. I didn't need motivation — I needed proof I wasn't falling behind. This gave me that.",
  },
];

/** @type {T[]} */
const AR = [
  {
    id: "r1",
    country: "SA",
    name: "نورة القحطاني",
    role: "مسؤولة موارد بشرية · الرياض",
    date: "مارس 2026",
    text: "كنت أستحي كل أحد ليلاً — أسبوع جديد ووعدت نفسي أرتب أموري وما صار. لما صار فيه سلسلة أيام واضحة في مسار، انكسر هذا الشعور. ما عاد أخمن؛ كل يوم أثبت لنفسي إني قادر.",
  },
  {
    id: "r2",
    country: "AE",
    name: "عمر حداد",
    role: "عمليات · دبي",
    date: "فبراير 2026",
    text: "بين العملاء والعيال عشت خوف دائم إني أنسى شي مهم. لوحة واحدة للعادات والمهام وقفت التخبيط في الرأس. صرت أقفل اللابتوب بدون ذلك الشعور المزعج: ماذا نسيت؟",
  },
  {
    id: "r3",
    country: "US",
    name: "إيميلي كارتر",
    role: "مصممة منتجات · أوستن، تكساس",
    date: "يناير 2026",
    text: "كنت أظن عندي فوضى ما لها حل. الحقيقة: ما كان عندي نظام. خمس دقايق كل صباح في مسار بدلت دوامة العار. مديري لاحظ إني «فجأة دايم متقدم» — هذا هو الفرق الحقيقي.",
  },
  {
    id: "r4",
    country: "TH",
    name: "سمساك فيشاي",
    role: "رائد أعمال · بانكوك",
    date: "مارس 2026",
    text: "كنت أشعر بالذنب — عشاء العائلة وأنا على الجوال «أشتغل» بس ما أنجز. الحين أسجل إنجازاتي بسرعة وأحط الجوال. الخوف إني أكون الأب اللي ما يثبت كلامه يخف يوم بعد يوم.",
  },
  {
    id: "r5",
    country: "SA",
    name: "عبدالله الحربي",
    role: "مهندس · الدمام",
    date: "فبراير 2026",
    text: "الإرهاق خلاني أشكك بأي تطبيق جديد. مسار ما طلب مني ثورة في حياتي — خلّى الاستمرار يبان. هالرؤية حولت الانضباط من عقاب لشي تبي تحافظ عليه.",
  },
  {
    id: "r6",
    country: "AE",
    name: "ليلى منصور",
    role: "تسويق · أبوظبي",
    date: "يناير 2026",
    text: "قارنت نفسي بزملاء يبدون فوق الترتيب. الحقيقة عندهم عادات ما عندي. مسار أعطاني هالعادات بدون مذكرات مبالغ فيها — خاص، سريع، لي.",
  },
  {
    id: "r7",
    country: "US",
    name: "جوردان بلايك",
    role: "مبيعات · نيويورك",
    date: "ديسمبر 2025",
    text: "الخوف إني أصير الشخص اللي عنده أفكار بس بدون تنفيذ. السلسلة والنقاط تبان سخيفة لين تصير دليل إنك ما تكذب على نفسك. هالدليل غيّر طريقة حضوري بالعمل.",
  },
  {
    id: "r8",
    country: "TH",
    name: "بيمشانوك سايليم",
    role: "معلمة · شيانغ ماي",
    date: "فبراير 2026",
    text: "كنت أخفي قوائم المهام لأنها تخجلني. مكان واحد للعادات والمهام وقف إعادة البداية من الصفر كل اثنين. الراحة تحس جسدياً — الكتفين يرتاحون لما الخطة تصير صادقة.",
  },
  {
    id: "r9",
    country: "SA",
    name: "محمد العمري",
    role: "رائد أعمال · جدة",
    date: "مارس 2026",
    text: "العملاء ما يشوفون الفوضى الداخلية — يشوفون التأخير. مسار صار قائمة تجهيز لحياتي: صحة، عمل عميق، وقت عائلة. بطلت أؤدي «المشغول» وصرت أقدّم هدوء.",
  },
  {
    id: "r10",
    country: "AE",
    name: "نورة الكتبي",
    role: "أم + مستشارة · الشارقة",
    date: "يناير 2026",
    text: "المدرسة + التسليمات كانت تخلّيني أبكي بعض الليال — مو حزن، بس زحمة فوق الطاقة. تقسيم اليوم لانتصارات صغيرة أنقذ رأسي. أتمنى لو لقيته قبل ما أقتنع إني «ما أعرف التوازن».",
  },
  {
    id: "r11",
    country: "US",
    name: "أليكس ريفيرا",
    role: "مهندس برمجيات · سياتل",
    date: "نوفمبر 2025",
    text: "عار اشتراك نادي ما أستخدمه — أدفع عشان انضباط ما يصير. مسار عكسها: سهل أجربه، منظم لدرجة ألتزم. أول مرة من سنين أفتخر بثلاثاء عادي، لا بس سنة جديدة.",
  },
  {
    id: "r12",
    country: "TH",
    name: "عنان ثونغدي",
    role: "مدير لوجستيات · بوكيت",
    date: "ديسمبر 2025",
    text: "قلق الصحة كان ياكلني — خطط كثيرة ومتابعة ضعيفة. لما صارت العادات وكتل التركيز العميق والمهام في إيقاع واحد على مسار، صار الخوف شي أقدر أتحرك عليه بدل ما يدور في الرأس. زوجتي لاحظت قبلي.",
  },
  {
    id: "r13",
    country: "SA",
    name: "سارة المطيري",
    role: "مدربة لياقة · الرياض",
    date: "مارس 2026",
    text: "أبيع الانضباط بس حتى المدربين يتعبون. مسار يثبت عاداتي الشخصية بدون ما أتفاخر أونلاين. هذي المساءلة الهادية اللي المحترفين يحتاجونها فعلاً.",
  },
  {
    id: "r14",
    country: "AE",
    name: "حسن الزعابي",
    role: "مالية · دبي",
    date: "فبراير 2026",
    text: "كنت غاضب من فلوس رميتها على تطبيقات تركتها. هذي استردت قيمتها من أول أسبوع لأنها تحترم الوقت — افتح، سجّل، خلص. الربح العاطفي أكبر من الميزات: رجعت أثق بنفسي.",
  },
  {
    id: "r15",
    country: "US",
    name: "تايلور بروكس",
    role: "طالب دراسات عليا · شيكاغو",
    date: "يناير 2026",
    text: "متلازمة المحتال + رعب الرسالة يدمّرون. مسار حول «نجيّز الفصل» لتكرار يومي أقدر أفوز فيه. ما احتاجت حماس — احتجت دليل إني ما أتخلف. هنا لقيته.",
  },
];

/** @type {T[]} */
const TH = [
  {
    id: "r1",
    country: "SA",
    name: "نورة القحطاني",
    role: "หัวหน้า HR · ริยาด",
    date: "มี.ค. 2026",
    text: "ทุกคืนวันอาทิตย์ฉันรู้สึกอาย — อีกสัปดาห์ที่สัญญาว่าจะจัดระเบียบแล้วไม่ทำ พอเห็นสตรีกใน Massar วงนั้นหาย ไม่ต้องเดาแล้ว แต่พิสูจน์ทุกวันว่าทำได้จริง",
  },
  {
    id: "r2",
    country: "AE",
    name: "Omar Haddad",
    role: "Operations · ดูไบ",
    date: "ก.พ. 2026",
    text: "ระหว่างลูกค้ากับลูกๆ ฉันใช้ชีวิตด้วยความกลัวว่าจะพลาดงานสำคัญ แดชบอร์ดเดียวสำหรับนิสัยและงาน หยุดการวนคิดในหัว ปิดโน้ตบุ๊กได้โดยไม่มีความรู้สึกค้างๆ ว่าลืมอะไรไป",
  },
  {
    id: "r3",
    country: "US",
    name: "Emily Carter",
    role: "Product designer · Austin, TX",
    date: "ม.ค. 2026",
    text: "คิดว่าตัวเองวุ่นวายระดับสมาธิสั้น ที่จริงแค่ไม่มีระบบ Massar ห้านาทีตอนเช้าแทนวงจรความอาย หัวหน้าบอกว่าฉันกลายเป็นคนที่ 'อยู่ข้างหน้าเสมอ' — นั่นคือ ROI จริง",
  },
  {
    id: "r4",
    country: "TH",
    name: "สมศักดิ์ วิชัย",
    role: "ผู้ก่อตั้งสตาร์ทอัพ · กรุงเทพฯ",
    date: "มี.ค. 2026",
    text: "รู้สึกผิดเวลากินข้าวกับครอบครัวแต่ยังจ้องมือถือ 'ทำงาน' แต่ไม่คืบหน้า ตอนนี้ล็อกชัยเร็วๆ วางมือถือลง ได้อยู่กับลูกจริงๆ ความกลัวว่าจะเป็นพ่อที่พูดไม่คิดกำลังจางลง",
  },
  {
    id: "r5",
    country: "SA",
    name: "Abdullah Al-Harbi",
    role: "วิศวกร · ดัมมาม",
    date: "ก.พ. 2026",
    text: "หมดไฟจนสงสัยทุกแอปใหม่ Massar ไม่บังคับพลิกชีวิต — แค่ทำให้ความสม่ำเสมอมองเห็นได้ พอเห็น วินัยกลายเป็นสิ่งที่อยากปกป้อง ไม่ใช่การลงโทษตัวเอง",
  },
  {
    id: "r6",
    country: "AE",
    name: "Layla Mansour",
    role: "การตลาด · อาบูดาบี",
    date: "ม.ค. 2026",
    text: "เคยเปรียบเทียบกับเพื่อนร่วมงานที่ดูจัดการได้หมด ที่จริงเขามีกิจวัตรที่ฉันไม่มี Massar ให้กิจวัตรนั้นแบบส่วนตัว เร็ว เป็นของฉันจริงๆ ไม่หวือหวา",
  },
  {
    id: "r7",
    country: "US",
    name: "Jordan Blake",
    role: "Sales · นิวยอร์ก",
    date: "ธ.ค. 2025",
    text: "อายุ 34 กลัวว่าจะเป็นคนมีไอเดียเยอะแต่ไม่ลงมือทำ สตรีกและแต้มฟังดูเด็ก จนกลายเป็นหลักฐานว่าไม่โกหกตัวเอง หลักฐานนั้นเปลี่ยนทุกอย่างที่ออฟฟิศ",
  },
  {
    id: "r8",
    country: "TH",
    name: "พิมพ์ชนก แสล้ม",
    role: "ครู · เชียงใหม่",
    date: "ก.พ. 2026",
    text: "เคยซ่อน to-do เพราะมันทำให้รู้สึกผิด ที่เดียวสำหรับนิสัย+งาน หยุดเริ่มใหม่ศูนย์ทุกวันจันทร์ ความโล่งหน้าอกเป็นรูปธรรม — เมื่อแผนซื่อสัตย์",
  },
  {
    id: "r9",
    country: "SA",
    name: "Mohammed Al-Amri",
    role: "ผู้ประกอบการ · เจดดะฮ์",
    date: "มี.ค. 2026",
    text: "ลูกค้าไม่เห็นความวุ่นวายข้างใน — เห็นแค่เดดไลน์ Massar กลายเป็นเช็กลิสต์ก่อนบิน: สุขภาพ งานลึก เวลาครอบครัว เลิกเล่นบท 'ยุ่ง' แล้วส่งมอบความนิ่ง",
  },
  {
    id: "r10",
    country: "AE",
    name: "Noora Al-Ketbi",
    role: "ที่ปรึกษา+แม่ · ชาร์จาห์",
    date: "ม.ค. 2026",
    text: "รับส่งลูก+ส่งงาน จนบางคืนร้องไม่ใช่เศร้า แค่หมดแรง แบ่งวันเป็นชัยเล็กๆ ที่ติ๊กได้ ช่วยรักษาสติ อยากเจอตั้งนานก่อนจะเชื่อว่า 'ไม่เก่งบาลานซ์'",
  },
  {
    id: "r11",
    country: "US",
    name: "Alex Rivera",
    role: "Software engineer · Seattle",
    date: "พ.ย. 2025",
    text: "ความอายเรื่องสมาชิกยิมที่ไม่ใช้ Massar พลิกเกม — ลองง่าย โครงสร้างพอดีจนติด เป็นครั้งแรกในรอบหลายปีที่ภูมิใจกับวันอังคารธรรมดา ไม่ใช่แค่ปีใหม่",
  },
  {
    id: "r12",
    country: "TH",
    name: "อนันต์ ทองดี",
    role: "ผู้จัดการโลจิสติกส์ · ภูเก็ต",
    date: "ธ.ค. 2025",
    text: "วิตกเรื่องสุขภาพแต่แผนเยอะ ทำจริงน้อย พอนิสัย การออกกำลังกาย และบล็อกงานโฟกัสลึกอยู่ในจังหวะเดียวกันใน Massar ความกลัวกลายเป็นสิ่งที่ลงมือได้ แทนที่จะวนในหัว ภรรยาสังเกตก่อนตัวเอง",
  },
  {
    id: "r13",
    country: "SA",
    name: "Sara Al-Mutairi",
    role: "โค้ชฟิตเนส · ริยาด",
    date: "มี.ค. 2026",
    text: "ขายวินัยให้คนแต่โค้ชก็หมดไฟได้ Massar ยึดนิสัยส่วนตัวให้แน่นโดยไม่ต้องโพสต์โอ้อวด มันคือความรับผิดชอบแบบเงียบๆ ที่คนเก่งจริงๆ ต้องการ",
  },
  {
    id: "r14",
    country: "AE",
    name: "Hassan Al-Zaabi",
    role: "การเงิน · ดูไบ",
    date: "ก.พ. 2026",
    text: "โกรธเงินที่เสียไปกับแอปทิ้ง Massar คืนค่าในสัปดาห์แรกเพราะเคารพเวลา — เปิด บันทึก จบ ชัยชนะทางอารมณ์ใหญ่กว่าฟีเจอร์: กลับมาเชื่อตัวเอง",
  },
  {
    id: "r15",
    country: "US",
    name: "Taylor Brooks",
    role: "นิสิตป.โท · ชิคาโก",
    date: "ม.ค. 2026",
    text: "ความรู้สึกเหมือนโกงตัวเองกับวิทยานิพนธ์กดดันหนัก Massar เปลี่ยนจาก 'เอาตัวรอดเทอม' เป็นชัยเล็กๆ ที่ชนะได้ทุกวัน ไม่ต้องการแรงบันดาลใจ แต่ต้องการหลักฐานว่าไม่ตกหล่น — ได้ครบที่นี่",
  },
];

/** @type {Record<string, T[]>} */
export const TESTIMONIALS = {
  en: attachAvatars(EN),
  ar: attachAvatars(AR),
  th: attachAvatars(TH),
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
      name: "Pimchanok Saelim",
      role: "Teacher · Chiang Mai, Thailand",
      quote: "One honest plan — shoulders finally drop.",
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
      name: "بيمشانوك سايليم",
      role: "معلمة · شيانغ ماي، تايلاند",
      quote: "خطة صادقة — وكأن الضغة نزلت عن كتفي.",
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
      role: "ดูไบ · สหรัฐอาหรับเอมิเรตส์",
      quote: "จอเดียวรวมทุกอย่าง",
      avatar: "/avatars/khalid.png",
      gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_3.gif?v=1765128020",
    },
    {
      name: "พิมพ์ชนก แสล้ม",
      role: "ครู · เชียงใหม่",
      quote: "แผนซื่อสัตย์ — หายใจโล่งขึ้นจริงๆ",
      avatar: "/avatars/noura.png",
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
