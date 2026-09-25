"use client";
import { useNow } from "@/lib/useNow";
import { istToEpoch } from "@/lib/time";
import { SLOT_META, type Slot } from "@/lib/draws";
import { fmtCountdown } from "@/lib/live";

/** Client-side status for a draw that has no result yet (today only). */
export function DrawStatus({ date, slot, compact = false }: { date: string; slot: Slot; compact?: boolean }) {
  const now = useNow(1000);
  const m = SLOT_META[slot];
  const at = istToEpoch(date, m.hour, m.minute);
  if (now === null) return <div className="h-[74px] animate-pulse rounded-2xl bg-surface-2" />;
  if (now < at) {
    return (
      <div className={`rounded-2xl border border-dashed border-line bg-surface-2 text-center ${compact ? "p-3" : "p-5"}`}>
        <div className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-muted">Draw starts in</div>
        <div className="num mt-1 text-3xl font-extrabold text-brand-2">{fmtCountdown(at - now)}</div>
        <div className="mt-1 text-xs text-muted">Result expected {m.expected} IST</div>
      </div>
    );
  }
  const late = now - at > 45 * 60_000;
  return (
    <div className={`rounded-2xl border border-live/30 bg-live/5 text-center ${compact ? "p-3" : "p-5"}`}>
      <div className="flex items-center justify-center gap-2 text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-live">
        <span className="live-dot" /> {late ? "Updating result" : "Live · Draw in progress"}
      </div>
      <div className="mt-1.5 text-sm font-semibold text-ink">
        {late ? "Result will appear here as soon as it is available." : `Result expected ${m.expected} IST`}
      </div>
      <div className="mt-1 text-xs text-muted">This page updates automatically – no need to refresh.</div>
    </div>
  );
}
