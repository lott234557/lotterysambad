import Link from "@/components/SiteLink";
import { ArrowRight } from "lucide-react";
import { SLOTS, SLOT_META, drawNameFor, type Slot } from "@/lib/draws";
import type { Result } from "@/lib/db/schema";
import type { SiteSettings } from "@/lib/settings";
import { isoToDMY } from "@/lib/time";
import { fmt, getDict, longDateL, lp, type Locale } from "@/lib/i18n";
import { statusText } from "@/lib/i18n/ui";
import { PrizeTiers } from "./PrizeTiers";
import { ResultImage } from "./ResultImage";
import { DrawStatus } from "./DrawStatus";
import { Ad } from "./Ad";

/** All three draws of a day with complete prize lists and images. */
export function DayFull({
  date,
  draws,
  isToday,
  s,
  lang = "en",
}: {
  date: string;
  draws: Partial<Record<Slot, Result>>;
  isToday: boolean;
  s: SiteSettings;
  lang?: Locale;
}) {
  const t = getDict(lang);
  return (
    <div className="space-y-12">
      {SLOTS.map((slot, i) => {
        const r = draws[slot];
        const m = SLOT_META[slot];
        const ts = t.slots[slot];
        const stateEn = r?.state ?? m.state;
        return (
          <section key={slot} id={slot} className="scroll-mt-24">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="eyebrow">{fmt(t.day.drawInfo, { time: ts.time, state: t.states[stateEn] ?? stateEn })}</div>
                <h2 className="section-title mt-1">{fmt(t.day.slotTitle, { slot: ts.label, name: r?.drawName ?? drawNameFor(slot, date, s.schedule) })}</h2>
              </div>
              <Link href={lp(lang, `/result/${isoToDMY(date)}/${slot}`)} className="inline-flex items-center gap-1 text-sm font-bold text-brand-2 transition-all hover:gap-2">
                {fmt(t.day.openSlot, { slot: ts.label })} <ArrowRight className="size-4" />
              </Link>
            </div>
            {r && (r.firstPrize || r.imageKey) ? (
              <div className="space-y-4">
                {r.firstPrize && <PrizeTiers result={r} prizes={s.prizes} id={`prizes-${slot}`} lang={lang} />}
                <ResultImage result={r} alt={fmt(t.result.title, { slot: ts.label, date: longDateL(t, date) })} lang={lang} />
              </div>
            ) : isToday ? (
              <div className="card p-5">
                <DrawStatus date={date} slot={slot} t={statusText(lang, slot)} />
              </div>
            ) : (
              <div className="card p-6 text-center text-sm text-muted">{t.card.notAvail}</div>
            )}
            {i < 2 && <Ad slot="inContent" className="pt-8" />}
          </section>
        );
      })}
    </div>
  );
}
