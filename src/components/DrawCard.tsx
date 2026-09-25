import Link from "next/link";
import { ArrowRight, CheckCircle2, Sun, Sunset, Moon, ImageIcon } from "lucide-react";
import { SLOT_META, drawNameFor, type Slot } from "@/lib/draws";
import type { Result } from "@/lib/db/schema";
import { isoToDMY, formatIST } from "@/lib/time";
import { FirstPrize } from "./FirstPrize";
import { DrawStatus } from "./DrawStatus";

const ICON = { "1pm": Sun, "6pm": Sunset, "8pm": Moon } as const;

export function DrawCard({
  slot,
  date,
  result,
  isToday,
  schedule,
  firstAmount,
}: {
  slot: Slot;
  date: string;
  result: Result | null | undefined;
  isToday: boolean;
  schedule?: Record<Slot, string[]>;
  firstAmount?: string;
}) {
  const m = SLOT_META[slot];
  const Icon = ICON[slot];
  const href = `/result/${isoToDMY(date)}/${slot}`;
  const name = result?.drawName || drawNameFor(slot, date, schedule);
  return (
    <article className="card group relative flex flex-col overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-brand-2 via-brand to-navy-2" />
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-gold-soft text-gold-2">
            <Icon className="size-5" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold leading-tight">
              <Link href={href} className="after:absolute after:inset-0">
                {m.time} Result
              </Link>
            </h3>
            <p className="text-xs font-semibold text-muted">{name}</p>
          </div>
        </div>
        {result?.firstPrize || result?.imageKey ? (
          <span className="pill bg-ok/10 text-ok">
            <CheckCircle2 className="size-3.5" /> Declared
          </span>
        ) : isToday ? (
          <span className="pill bg-surface-2 text-muted">{m.expected.split("–")[0].trim()}</span>
        ) : (
          <span className="pill bg-surface-2 text-muted">N/A</span>
        )}
      </div>
      <div className="px-5">
        {result?.firstPrize ? (
          <FirstPrize number={result.firstPrize} amount={firstAmount} />
        ) : result?.imageKey ? (
          <div className="flex items-center gap-3 rounded-2xl bg-gold-soft p-4 text-sm font-semibold">
            <ImageIcon className="size-5 text-gold-2" /> Result image published – numbers updating
          </div>
        ) : isToday ? (
          <DrawStatus date={date} slot={slot} compact />
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">Result not available for this draw.</div>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 px-5 pb-5 pt-4 text-[0.8rem]">
        <span className="text-muted">{result?.publishedAt ? `Updated ${formatIST(result.updatedAt).split(", ")[1]}` : m.state + " State"}</span>
        <span className="inline-flex items-center gap-1 font-bold text-brand-2 transition-all group-hover:gap-2">
          Full result <ArrowRight className="size-4" />
        </span>
      </div>
    </article>
  );
}
