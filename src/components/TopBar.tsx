"use client";
import Link from "next/link";
import { Clock3, Timer } from "lucide-react";
import { useNow } from "@/lib/useNow";
import { nowIST } from "@/lib/time";
import { nextDraw, fmtCountdown } from "@/lib/live";

const pad = (n: number) => String(n).padStart(2, "0");

export type TopBarText = {
  monthsShort: string[];
  weekdays: string[];
  am: string;
  pm: string;
  next: string;
  ist: string;
  slots: Record<string, { label: string; href: string }>;
};

export function TopBar({ t }: { t: TopBarText }) {
  const now = useNow(1000);
  const n = now ? nowIST(now) : null;
  const nd = now ? nextDraw(now) : null;
  const h12 = n ? n.hours % 12 || 12 : 0;
  return (
    <div className="bg-navy text-white/90 text-[0.78rem]">
      <div className="wrap flex h-9 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Clock3 className="size-3.5 shrink-0 text-gold" />
          <span className="truncate" suppressHydrationWarning>
            {n ? (
              <>
                <span className="hidden sm:inline">{t.weekdays[n.weekday]}, </span>
                {n.day} {t.monthsShort[n.month - 1]}
                <span className="hidden min-[420px]:inline"> {n.year}</span>
                <span className="mx-1.5 text-white/40">•</span>
                <b className="num font-bold text-white">
                  {pad(h12)}:{pad(n.minutes)}:{pad(n.seconds)} {n.hours < 12 ? t.am : t.pm}
                </b>
                <span className="ml-1 font-bold text-gold">{t.ist}</span>
              </>
            ) : (
              <span className="inline-block h-3 w-44 animate-pulse rounded bg-white/15 align-middle" />
            )}
          </span>
        </div>
        {nd && (
          <Link href={t.slots[nd.slot].href} className="flex shrink-0 items-center gap-1.5 hover:text-white">
            <Timer className="size-3.5 text-gold" />
            <span className="hidden sm:inline">{t.next}</span>
            <b className="text-white">{t.slots[nd.slot].label}</b>
            <span className="num rounded bg-white/10 px-1.5 py-0.5 font-bold text-gold">{fmtCountdown(nd.at - (now ?? 0))}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
