import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const sizeClasses = {
  header: "h-10 sm:h-11 w-auto max-w-[220px] sm:max-w-[280px]",
  footer: "h-9 sm:h-10 w-auto max-w-[240px]",
  auth: "h-16 sm:h-[4.5rem] w-auto max-w-[min(100%,360px)]",
  compact: "h-8 w-auto max-w-[180px]",
};

/**
 * Horizontal Massar brand lockup (logo-wide.png).
 */
export default function BrandLogo({
  size = "header",
  className,
  asLink = false,
  to = "/",
  ...props
}) {
  const img = (
    <img
      src="/logo-wide.png"
      alt="مسار · Massar — Habit & Task Tracker"
      className={cn("object-contain object-right", sizeClasses[size], className)}
      {...props}
    />
  );

  if (asLink) {
    return (
      <Link to={to} className="inline-flex flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
        {img}
      </Link>
    );
  }

  return img;
}
