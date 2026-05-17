import { ArrowLeft, ArrowRight } from "lucide-react";

/** Back navigation chevron (points toward the start of the reading direction). */
export function BackChevron({ className = "w-4 h-4" }) {
  return (
    <>
      <ArrowLeft className={`${className} inline rtl:hidden`} aria-hidden />
      <ArrowRight className={`${className} hidden rtl:inline`} aria-hidden />
    </>
  );
}

/** Forward / continue chevron (points toward the end of the reading direction). */
export function ForwardChevron({ className = "w-5 h-5" }) {
  return (
    <>
      <ArrowRight className={`${className} inline rtl:hidden`} aria-hidden />
      <ArrowLeft className={`${className} hidden rtl:inline`} aria-hidden />
    </>
  );
}
