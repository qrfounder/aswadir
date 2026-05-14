import StarRating from "./StarRating";

export default function TestimonialCard({ name, role, text, avatar, verified = true, date }) {
  return (
    <div className="testimonial-card rounded-2xl p-5 flex flex-col gap-3 h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-yellow-500/30 to-yellow-700/20 flex-shrink-0 border border-yellow-500/20">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-yellow-400 font-black text-lg">
                {name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-white font-bold text-sm">{name}</p>
              {verified && (
                <span className="text-xs bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded-full border border-green-500/25">✓ موثق</span>
              )}
            </div>
            {role && <p className="text-gray-400 text-xs mt-0.5">{role}</p>}
          </div>
        </div>
        <StarRating size="sm" />
      </div>
      <p className="text-gray-200 text-sm leading-relaxed flex-1">"{text}"</p>
      {date && <p className="text-gray-500 text-xs">{date}</p>}
    </div>
  );
}