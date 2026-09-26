"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight } from "lucide-react";
import { isActive, type NavItem } from "@/lib/nav";

export function MobileMenu({
  items,
  labels,
  footer,
}: {
  items: NavItem[];
  labels: { menu: string; open: string; close: string };
  footer?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const home = items[0]?.href ?? "/";

  // Portal to <body>: the sticky header uses backdrop-blur, which would trap a fixed panel inside it.
  const panel = (
    <div className="fixed inset-0 z-[70] xl:hidden" role="dialog" aria-modal="true" aria-label={labels.menu}>
      <button className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label={labels.close} onClick={() => setOpen(false)} />
      <div className="absolute right-0 top-0 flex h-dvh w-[86%] max-w-sm flex-col bg-surface text-ink shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="text-sm font-extrabold uppercase tracking-widest text-muted">{labels.menu}</span>
          <button onClick={() => setOpen(false)} className="grid size-9 place-items-center rounded-lg border border-line" aria-label={labels.close}>
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 pb-4">
          {items.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between rounded-xl px-4 py-3.5 font-semibold ${
                isActive(path, n.href, home) ? "bg-gold-soft text-ink" : "hover:bg-surface-2"
              }`}
            >
              {n.label}
              <ChevronRight className="size-4 text-muted" />
            </Link>
          ))}
        </nav>
        {footer && <div className="border-t border-line p-4">{footer}</div>}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-xl border border-line bg-surface xl:hidden"
        aria-label={labels.open}
        aria-expanded={open}
      >
        <Menu className="size-5" />
      </button>
      {open && createPortal(panel, document.body)}
    </>
  );
}
