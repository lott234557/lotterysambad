"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { NAV, MORE } from "@/lib/nav";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-xl border border-line bg-surface lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <Menu className="size-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="text-sm font-extrabold uppercase tracking-widest text-muted">Menu</span>
              <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg border border-line" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              {[...NAV, ...MORE].map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center justify-between rounded-xl px-4 py-3.5 font-semibold ${
                    (n.href === "/" ? path === "/" : path.startsWith(n.href)) ? "bg-gold-soft text-ink" : "hover:bg-surface-2"
                  }`}
                >
                  {n.label}
                  <ChevronRight className="size-4 text-muted" />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
