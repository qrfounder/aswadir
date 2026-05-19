import { createPortal } from "react-dom";

const menuSurfaceClass =
  "rounded-xl border border-brand/30 bg-[#0f1424] py-1 shadow-2xl shadow-black/60 ring-1 ring-primary/10";

/**
 * @param {{ open: boolean, menuRef: import('react').RefObject<HTMLElement>, pos: { top: number, left: number, minWidth: number }, children: import('react').ReactNode, className?: string, listboxLabel?: string }} props
 */
export default function AnchoredDropdownMenu({
  open,
  menuRef,
  pos,
  children,
  className = "",
  listboxLabel,
}) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <ul
      ref={menuRef}
      role="listbox"
      aria-label={listboxLabel}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        minWidth: pos.minWidth,
        zIndex: 10000,
      }}
      className={`${menuSurfaceClass} max-h-[min(18rem,70vh)] overflow-y-auto ${className}`}
    >
      {children}
    </ul>,
    document.body,
  );
}
