"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { isActive, type NavItem } from "@/lib/nav";

export function NavLinks({ items, more, moreLabel }: { items: NavItem[]; more: NavItem[]; moreLabel: string }) {
  const path = usePathname();
  const home = items[0].href;
  return (
    <nav aria-label="Main" className="hidden xl:flex items-center gap-0.5">
      {items.map((n) => {
        const on = isActive(path, n.href, home);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`relative whitespace-nowrap rounded-lg px-2.5 py-2 text-[0.86rem] font-semibold transition xl:px-3 ${
              on ? "text-brand-2" : "text-ink/80 hover:text-ink hover:bg-surface-2"
            }`}
          >
            {n.label}
            {on && <span className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-full bg-gold" />}
          </Link>
        );
      })}
      <div className="group relative">
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-[0.86rem] font-semibold text-ink/80 hover:bg-surface-2 hover:text-ink xl:px-3"
          aria-haspopup="true"
        >
          {moreLabel} <ChevronDown className="size-4 transition group-hover:rotate-180 group-focus-within:rotate-180" />
        </button>
        <div className="invisible absolute right-0 top-full z-50 w-72 translate-y-1 pt-3 opacity-0 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <div className="card overflow-hidden p-1.5">
            {more.map((m) => (
              <Link key={m.href} href={m.href} className="block rounded-xl px-3 py-2.5 hover:bg-surface-2">
                <span className="block text-sm font-bold text-ink">{m.label}</span>
                {m.desc && <span className="block text-xs text-muted">{m.desc}</span>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
