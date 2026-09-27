"use client";
import { useNow } from "@/lib/useNow";
import { istToEpoch } from "@/lib/time";
import { fmtCountdown } from "@/lib/live";

type Labels = { title: string; startsIn: string; expected: string; live: string; auto: string };

/** Countdown / "being published" box for a lottery whose result of today is not in yet. */
export function OtherStatus({ date, drawMinute, t }: { date: string; drawMinute: number; t: Labels }) {
  const now = useNow(1000);
  const at = istToEpoch(date, Math.floor(drawMinute / 60), drawMinute % 60);
  if (now === null) return <div className="h-[92px] animate-pulse rounded-2xl bg-surface-2" />;
  if (now < at) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface-2 p-5 text-center">
        <div className="text-sm font-extrabold">{t.title}</div>
        <div className="mt-2 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-muted">{t.startsIn}</div>
        <div className="num mt-1 text-3xl font-extrabold text-brand-2">{fmtCountdown(at - now)}</div>
        <div className="mt-1 text-xs text-muted">{t.expected}</div>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-live/30 bg-live/5 p-5 text-center">
      <div className="flex items-center justify-center gap-2 text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-live">
        <span className="live-dot" /> {t.live}
      </div>
      <div className="mt-1.5 text-sm font-semibold text-ink">{t.title}</div>
      <div className="mt-1 text-xs text-muted">{t.auto}</div>
    </div>
  );
}
