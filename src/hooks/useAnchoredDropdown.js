import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Dropdown anchored to a button, rendered via portal so parent overflow cannot clip it.
 */
export function useAnchoredDropdown() {
  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, minWidth: 144 });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const minWidth = Math.max(rect.width, 144);
    const rtl = document.documentElement.dir === "rtl";
    const left = rtl ? rect.left : rect.right - minWidth;
    const clampedLeft = Math.max(8, Math.min(left, window.innerWidth - minWidth - 8));
    setPos({
      top: rect.bottom + 6,
      left: clampedLeft,
      minWidth,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (anchorRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return { anchorRef, menuRef, open, setOpen, toggle, close, pos };
}
