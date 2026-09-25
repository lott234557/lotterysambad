"use client";
import { useEffect, useRef } from "react";

/** Renders raw ad HTML (AdSense or any network) and executes its <script> tags. */
export function AdSlot({ code, className = "" }: { code: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !code) return;
    el.innerHTML = code;
    el.querySelectorAll("script").forEach((old) => {
      const s = document.createElement("script");
      for (const a of Array.from(old.attributes)) s.setAttribute(a.name, a.value);
      s.text = old.text;
      old.replaceWith(s);
    });
  }, [code]);
  if (!code) return null;
  return (
    <div className={`ad-slot mx-auto w-full text-center ${className}`}>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted/70">Advertisement</div>
      <div ref={ref} className="min-h-[90px] overflow-hidden" />
    </div>
  );
}
