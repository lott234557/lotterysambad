"use client";
import Link from "@/components/SiteLink";
import { usePathname } from "next/navigation";
import { House, Sun, Sunset, Moon, CalendarDays } from "lucide-react";
import { isActive } from "@/lib/nav";

const ICONS = { home: House, sun: Sun, sunset: Sunset, moon: Moon, calendar: CalendarDays };

export function BottomNav({ items }: { items: { href: string; label: string; icon: keyof typeof ICONS }[] }) {
  const path = usePathname();
  const home = items[0].href;
  return (
    <nav
      aria-label="Quick results"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map(({ href, label, icon }) => {
          const Icon = ICONS[icon];
          const on = isActive(path, href, home);
          return (
            <li key={href}>
              <Link href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[0.68rem] font-bold ${on ? "text-brand-2" : "text-muted"}`}>
                <span className={`grid h-7 w-12 place-items-center rounded-full transition ${on ? "bg-gold text-[#1c1400]" : ""}`}>
                  <Icon className="size-[18px]" />
                </span>
                <span className="max-w-full truncate px-1">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
