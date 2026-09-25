import Link from "next/link";
import { SLOTS, SLOT_META, drawNameFor, type Slot } from "@/lib/draws";
import type { Result } from "@/lib/db/schema";
import type { SiteSettings } from "@/lib/settings";
import { isoToDMY, longDate } from "@/lib/time";
import { PrizeTiers } from "./PrizeTiers";
import { ResultImage } from "./ResultImage";
import { DrawStatus } from "./DrawStatus";
import { Ad } from "./Ad";
import { ArrowRight } from "lucide-react";

/** All three draws of a day with complete prize lists and images. */
export function DayFull({ date, draws, isToday, s }: { date: string; draws: Partial<Record<Slot, Result>>; isToday: boolean; s: SiteSettings }) {
  return (
    <div className="space-y-12">
      {SLOTS.map((slot, i) => {
        const r = draws[slot];
        const m = SLOT_META[slot];
        return (
          <section key={slot} id={slot} className="scroll-mt-24">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="eyebrow">{m.time} draw · {m.state}</div>
                <h2 className="section-title mt-1">
                  Lottery Sambad {m.label} Result – {r?.drawName ?? drawNameFor(slot, date, s.schedule)}
                </h2>
              </div>
              <Link href={`/result/${isoToDMY(date)}/${slot}`} className="inline-flex items-center gap-1 text-sm font-bold text-brand-2 hover:gap-2 transition-all">
                Open {m.label} page <ArrowRight className="size-4" />
              </Link>
            </div>
            {r && (r.firstPrize || r.imageKey) ? (
              <div className="space-y-4">
                {r.firstPrize && <PrizeTiers result={r} prizes={s.prizes} id={`prizes-${slot}`} />}
                <ResultImage result={r} alt={`Lottery Sambad ${m.label} result ${longDate(date)}`} />
              </div>
            ) : isToday ? (
              <div className="card p-5">
                <DrawStatus date={date} slot={slot} />
              </div>
            ) : (
              <div className="card p-6 text-center text-sm text-muted">Result not available for this draw.</div>
            )}
            {i < 2 && <Ad slot="inContent" className="pt-8" />}
          </section>
        );
      })}
    </div>
  );
}
