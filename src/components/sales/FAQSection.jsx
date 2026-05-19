import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function FAQSection() {
  const { t } = useTranslation();
  const faqs = t("faq.items", { returnObjects: true });
  const [open, setOpen] = useState(null);

  if (!Array.isArray(faqs)) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            type="button"
            className="w-full flex items-center justify-between gap-3 p-4 text-start"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <ChevronDown
              className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${
                open === i ? "rotate-180" : ""
              }`}
            />
            <span className="text-white font-bold text-sm flex-1 text-start">{faq.q}</span>
          </button>
          {open === i && (
            <div className="px-4 pb-4 border-t border-brand/10">
              <p className="text-gray-300 text-sm leading-relaxed pt-3">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
