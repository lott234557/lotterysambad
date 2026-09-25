"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Sun, Sunset, Moon, CalendarDays } from "lucide-react";

const ITEMS = [
  { href: "/", label: "Home", Icon: House },
  { href: "/lottery-sambad-1pm-result", label: "1 PM", Icon: Sun },
  { href: "/lottery-sambad-6pm-result", label: "6 PM", Icon: Sunset },
  { href: "/lottery-sambad-8pm-result", label: "8 PM", Icon: Moon },
  { href: "/old-results", label: "Old", Icon: CalendarDays },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Quick results"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map(({ href, label, Icon }) => {
          const on = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[0.68rem] font-bold ${on ? "text-brand-2" : "text-muted"}`}>
                <span className={`grid h-7 w-12 place-items-center rounded-full transition ${on ? "bg-gold text-[#1c1400]" : ""}`}>
                  <Icon className="size-[18px]" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
