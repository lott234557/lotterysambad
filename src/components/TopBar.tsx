"use client";
import Link from "next/link";
import { Clock3, Timer } from "lucide-react";
import { useNow } from "@/lib/useNow";
import { nowIST, MONTHS_SHORT, WEEKDAYS } from "@/lib/time";
import { SLOT_META } from "@/lib/draws";
import { nextDraw, fmtCountdown } from "@/lib/live";

const pad = (n: number) => String(n).padStart(2, "0");

export function TopBar() {
  const now = useNow(1000);
  const t = now ? nowIST(now) : null;
  const nd = now ? nextDraw(now) : null;
  const h12 = t ? t.hours % 12 || 12 : 0;
  return (
    <div className="bg-navy text-white/90 text-[0.78rem]">
      <div className="wrap flex h-9 items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Clock3 className="size-3.5 text-gold shrink-0" />
          <span className="truncate" suppressHydrationWarning>
            {t ? (
              <>
                <span className="hidden sm:inline">{WEEKDAYS[t.weekday]}, </span>
                {t.day} {MONTHS_SHORT[t.month - 1]} {t.year}
                <span className="mx-1.5 text-white/40">•</span>
                <b className="num font-bold text-white">
                  {pad(h12)}:{pad(t.minutes)}:{pad(t.seconds)} {t.hours < 12 ? "AM" : "PM"}
                </b>
                <span className="ml-1 text-gold font-bold">IST</span>
              </>
            ) : (
              <span className="inline-block h-3 w-44 animate-pulse rounded bg-white/15 align-middle" />
            )}
          </span>
        </div>
        {nd && (
          <Link href={SLOT_META[nd.slot].path} className="flex items-center gap-1.5 shrink-0 hover:text-white">
            <Timer className="size-3.5 text-gold" />
            <span className="hidden sm:inline">Next draw</span>
            <b className="text-white">{SLOT_META[nd.slot].label}</b>
            <span className="num rounded bg-white/10 px-1.5 py-0.5 font-bold text-gold">{fmtCountdown(nd.at - (now ?? 0))}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
