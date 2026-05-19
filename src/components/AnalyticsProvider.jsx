import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { captureAttributionFromUrl } from "@/lib/attribution.js";
import { trackPageView } from "@/lib/analytics-tracker.js";

export default function AnalyticsProvider({ children }) {
  const location = useLocation();
  const lastPath = useRef("");

  useEffect(() => {
    captureAttributionFromUrl(location.search);
  }, [location.search]);

  useEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return;
    lastPath.current = path;
    if (path.startsWith("/mojourney")) return;
    trackPageView(path);
  }, [location.pathname]);

  return children;
}
