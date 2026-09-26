"use client";
import { useEffect, useRef } from "react";

/**
 * Hover / focus tooltip for any descendant with a `data-tip` attribute.
 * Text is set with textContent (never HTML). Hit targets are the whole row/column, not just the mark.
 */
export function ChartTips({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    const tip = tipRef.current;
    if (!root || !tip) return;
    const hide = () => {
      tip.style.display = "none";
    };
    const show = (target: HTMLElement, x: number, y: number) => {
      tip.textContent = target.dataset.tip ?? "";
      tip.style.display = "block";
      const w = tip.offsetWidth;
      const h = tip.offsetHeight;
      let left = x + 14;
      let top = y - h - 12;
      if (left + w > window.innerWidth - 8) left = Math.max(8, x - w - 14);
      if (top < 8) top = y + 18;
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
    };
    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-tip]");
      if (!target || !root.contains(target)) return hide();
      show(target, e.clientX, e.clientY);
    };
    const onFocus = (e: FocusEvent) => {
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-tip]");
      if (!target) return;
      const r = target.getBoundingClientRect();
      show(target, r.left + Math.min(r.width / 2, 120), r.top);
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", hide);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("focusout", hide);
    window.addEventListener("scroll", hide, { passive: true });
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", hide);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("focusout", hide);
      window.removeEventListener("scroll", hide);
    };
  }, []);

  return (
    <div ref={ref} className={`chart ${className}`}>
      {children}
      <div ref={tipRef} className="chart-tip" role="tooltip" style={{ display: "none" }} />
    </div>
  );
}
