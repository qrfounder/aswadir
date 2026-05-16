import { useState } from "react";
import { Check, Info, Star, Zap } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { PRODUCTS } from "@/lib/products";

export default function PricingSection({ onSelectProduct }) {
  const [selected, setSelected] = useState("bundle");

  const handleBuy = () => {
    const product = PRODUCTS.find((p) => p.id === selected);
    if (product) onSelectProduct(product);
  };

  return (
    <div className="space-y-5">
      {/* Urgency */}
      <div className="flex items-center justify-between dark-card rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-gray-300 text-sm font-bold">سعر الخصم يخلص خلال:</span>
        </div>
        <CountdownTimer initialMinutes={47} />
      </div>

      {/* Plans */}
      <div className="space-y-3">
        {PRODUCTS.map((product) => (
          <button
            key={product.id}
            onClick={() => setSelected(product.id)}
            className={`w-full text-right rounded-2xl p-4 border-2 transition-all duration-300 relative ${
              selected === product.id
                ? "border-yellow-400 bg-yellow-400/5 glow-gold-sm"
                : "border-gray-700/50 bg-white/2 hover:border-gray-600"
            }`}
          >
            {product.popular && (
              <div className="absolute -top-3 right-4">
                <span className="gold-bg text-black text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" fill="currentColor" />
                  {product.badge}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selected === product.id ? "border-yellow-400 bg-yellow-400" : "border-gray-500"
                }`}>
                  {selected === product.id && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-base">{product.name}</p>
                  <p className="text-gray-400 text-xs">{product.subtitle}</p>
                  <ul className="mt-1.5 space-y-0.5">
                    {product.features.slice(0, 2).map((f, i) => (
                      <li key={i} className="text-gray-300 text-xs flex items-center gap-1">
                        <Check className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="text-left flex-shrink-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="bg-red-500/20 text-red-400 text-xs font-black px-2 py-0.5 rounded border border-red-500/30">
                    -{product.discount}
                  </span>
                </div>
                <p className="text-gray-500 text-xs line-through">{product.originalPrice} ر.س</p>
                <p className="text-yellow-400 text-2xl font-black price-tag">{product.salePrice}</p>
                <p className="text-yellow-600 text-xs">ر.س</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="dark-card rounded-xl p-4 border border-yellow-400/15 flex gap-3 items-start">
        <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-right space-y-2">
          <p className="text-white font-black text-sm">وضوح السعر</p>
          <ul className="text-gray-400 text-xs leading-relaxed space-y-1.5">
            <li className="flex gap-2 items-start">
              <Check className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span>دفعة واحدة فقط: ما في اشتراك شهري بعد الشراء.</span>
            </li>
            <li className="flex gap-2 items-start">
              <Check className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span>السعر يشمل الملفات الجاهزة والصيغ ووصولك بحسب وصف الباقة.</span>
            </li>
            <li className="flex gap-2 items-start">
              <Check className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span>عروض الخصم على الصفحة تختلف أحياناً عن الإعلانات حسب الفترة.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleBuy}
        className="cta-button w-full py-5 rounded-2xl text-lg font-black flex items-center justify-center gap-2 pulse-gold"
      >
        <Zap className="w-5 h-5" /> اشتري الحين بس {PRODUCTS.find((p) => p.id === selected)?.salePrice} ر.س
      </button>

      {/* Micro copy */}
      <p className="text-center text-gray-400 text-xs flex items-center justify-center gap-2 flex-wrap">
        دفع آمن • ضمان استرداد 21 يوم • توصلك فوري
      </p>
    </div>
  );
}