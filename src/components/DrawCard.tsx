import Link from "next/link";
import { ArrowRight, CheckCircle2, Sun, Sunset, Moon, ImageIcon } from "lucide-react";
import { SLOT_META, drawNameFor, type Slot } from "@/lib/draws";
import type { Result } from "@/lib/db/schema";
import { isoToDMY } from "@/lib/time";
import { fmt, getDict, lp, timeISTL, type Locale } from "@/lib/i18n";
import { statusText } from "@/lib/i18n/ui";
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
  lang = "en",
}: {
  slot: Slot;
  date: string;
  result: Result | null | undefined;
  isToday: boolean;
  schedule?: Record<Slot, string[]>;
  firstAmount?: string;
  lang?: Locale;
}) {
  const t = getDict(lang);
  const m = SLOT_META[slot];
  const ts = t.slots[slot];
  const Icon = ICON[slot];
  const href = lp(lang, `/result/${isoToDMY(date)}/${slot}`);
  const name = result?.drawName || drawNameFor(slot, date, schedule);
  const state = t.states[m.state] ?? m.state;
  return (
    <article className="card group relative flex flex-col overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-brand-2 via-brand to-navy-2" />
      <div className="flex items-start justify-between gap-3 p-5 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold-soft text-gold-2">
            <Icon className="size-5" />
          </span>
          <div>
            <h3 className="text-lg font-extrabold leading-tight">
              <Link href={href} className="after:absolute after:inset-0">
                {fmt(t.card.result, { time: ts.time })}
              </Link>
            </h3>
            <p className="text-xs font-semibold text-muted">{name}</p>
          </div>
        </div>
        {result?.firstPrize || result?.imageKey ? (
          <span className="pill shrink-0 bg-ok/10 text-ok">
            <CheckCircle2 className="size-3.5" /> {t.card.declared}
          </span>
        ) : isToday ? (
          <span className="pill shrink-0 bg-surface-2 text-muted">{ts.expected.split("–")[0].trim()}</span>
        ) : (
          <span className="pill shrink-0 bg-surface-2 text-muted">{t.card.na}</span>
        )}
      </div>
      <div className="px-5">
        {result?.firstPrize ? (
          <FirstPrize number={result.firstPrize} amount={firstAmount} label={t.tiers.first} awaiting={t.prize.awaiting} />
        ) : result?.imageKey ? (
          <div className="flex items-center gap-3 rounded-2xl bg-gold-soft p-4 text-sm font-semibold">
            <ImageIcon className="size-5 shrink-0 text-gold-2" /> {t.card.imageOut}
          </div>
        ) : isToday ? (
          <DrawStatus date={date} slot={slot} compact t={statusText(lang, slot)} />
        ) : (
          <div className="rounded-2xl border border-dashed border-line p-5 text-center text-sm text-muted">{t.card.notAvail}</div>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 px-5 pb-5 pt-4 text-[0.8rem]">
        <span className="text-muted">{result?.publishedAt ? fmt(t.common.updated, { t: timeISTL(t, result.updatedAt) }) : fmt(t.common.state, { state })}</span>
        <span className="inline-flex items-center gap-1 font-bold text-brand-2 transition-all group-hover:gap-2">
          {t.card.full} <ArrowRight className="size-4" />
        </span>
      </div>
    </article>
  );
}
