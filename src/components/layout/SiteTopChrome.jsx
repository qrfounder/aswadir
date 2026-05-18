import UrgencyBar from "@/components/sales/UrgencyBar";
import SiteHeader from "@/components/layout/SiteHeader";

/** Single sticky top stack — avoids double-sticky jitter and wrong top offset. */
export default function SiteTopChrome() {
  return (
    <div className="site-top-chrome sticky top-0 z-50 w-full max-w-[100vw] overflow-x-hidden">
      <UrgencyBar embedded />
      <SiteHeader embedded />
    </div>
  );
}
