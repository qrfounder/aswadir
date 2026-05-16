import { BadgeCheck, Play } from "lucide-react";

const CLIPS = [
  {
    gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
    name: "محمد العمري",
    role: "رائد أعمال",
    quote: "صار لي 6 شهور ما فوّتت يوم.",
    avatar: "/avatars/mohammed.png",
  },
  {
    gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_2.gif?v=1765128013",
    name: "خالد الشمري",
    role: "مدير تسويق",
    quote: "لما السلسلة تطول مستحيل تبي توقف.",
    avatar: "/avatars/khalid.png",
  },
  {
    gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_3.gif?v=1765128020",
    name: "سارة المطيري",
    role: "مدربة لياقة",
    quote: "أكثر من 90 يوم ما قطعت تمريني.",
    avatar: "/avatars/sara.png",
  },
  {
    gif: "https://cdn.shopify.com/s/files/1/0798/1675/3394/files/Video_1.gif?v=1765127696",
    name: "فيصل الدوسري",
    role: "مستشار مالي",
    quote: "5 دقايق صباحاً وأعرف يومي كامل.",
    avatar: "/avatars/faisal.png",
  },
];

export default function VideoTestimonialsStrip() {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto px-2">
        <p className="text-yellow-400/80 text-sm font-bold mb-2">شاهد من الشاشة نفسها</p>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          تجارب سريعة من <span className="gold-gradient">المستخدمين</span>
        </h2>
        <p className="text-gray-400 text-sm">
          مرّر يمين ويسار على الجوال. المقاطع توضح شكل النظام أثناء الاستخدام اليومي.
        </p>
      </div>

      <div className="relative -mx-4 px-4">
        <div
          className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {CLIPS.map((item, index) => (
            <article
              key={`${item.name}-${index}`}
              className="flex-none w-[min(280px,82vw)] snap-start rounded-2xl overflow-hidden border border-yellow-400/20 bg-black/40 shadow-lg"
            >
              <div className="relative aspect-[4/3] bg-gray-900">
                <img
                  src={item.gif}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="w-14 h-14 rounded-full bg-black/55 backdrop-blur-sm border border-yellow-400/40 flex items-center justify-center">
                    <Play className="w-7 h-7 text-yellow-300 -scale-x-100" fill="currentColor" />
                  </span>
                </div>
              </div>
              <div className="p-4 flex gap-3">
                <img
                  src={item.avatar}
                  alt=""
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0 border border-yellow-400/20"
                />
                <div className="min-w-0 text-right">
                  <div className="flex items-center gap-1 justify-end flex-wrap">
                    <p className="text-white font-bold text-sm truncate">{item.name}</p>
                    <BadgeCheck className="w-4 h-4 text-sky-400 flex-shrink-0" aria-hidden />
                  </div>
                  <p className="text-gray-500 text-xs">{item.role}</p>
                  <p className="text-gray-200 text-sm mt-1.5 leading-snug">&ldquo;{item.quote}&rdquo;</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
