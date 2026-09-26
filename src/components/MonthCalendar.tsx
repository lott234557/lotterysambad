import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SLOTS } from "@/lib/draws";
import type { DayRow } from "@/lib/results";
import { addMonths, daysInMonth, isoToDMY, weekdayOf } from "@/lib/time";
import { fmt, getDict, longDateL, lp, monthLabelL, type Locale } from "@/lib/i18n";

export function MonthCalendar({ month, days, today, lang = "en" }: { month: string; days: DayRow[]; today: string; lang?: Locale }) {
  const t = getDict(lang);
  const map = new Map(days.map((d) => [d.date, d]));
  const first = weekdayOf(`${month}-01`);
  const n = daysInMonth(month);
  const cells: (string | null)[] = [...Array(first).fill(null), ...Array.from({ length: n }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
  const prev = addMonths(month, -1);
  const next = addMonths(month, 1);
  const hasNext = `${next}-01` <= today;
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-3">
        <Link href={lp(lang, `/old-results/${prev}`)} className="grid size-9 place-items-center rounded-lg border border-line bg-surface hover:border-brand-2" aria-label={monthLabelL(t, prev)}>
          <ChevronLeft className="size-4" />
        </Link>
        <h2 className="text-base font-extrabold">{monthLabelL(t, month)}</h2>
        {hasNext ? (
          <Link href={lp(lang, `/old-results/${next}`)} className="grid size-9 place-items-center rounded-lg border border-line bg-surface hover:border-brand-2" aria-label={monthLabelL(t, next)}>
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span className="size-9" />
        )}
      </div>
      <div className="grid grid-cols-7 gap-1 p-2 text-center text-[0.7rem] font-bold uppercase tracking-wider text-muted sm:gap-2 sm:p-4">
        {t.weekdaysShort.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          if (!c) return <div key={i} />;
          const d = map.get(c);
          const future = c > today;
          const day = Number(c.slice(8));
          const inner = (
            <>
              <span className={`text-sm font-extrabold sm:text-base ${c === today ? "text-brand-2" : "text-ink"}`}>{day}</span>
              <span className="mt-1 flex justify-center gap-1">
                {SLOTS.map((s) => (
                  <span key={s} className={`size-1.5 rounded-full ${d?.draws[s] ? "bg-gold-2" : "bg-line"}`} />
                ))}
              </span>
            </>
          );
          return future ? (
            <div key={c} className="flex flex-col items-center rounded-xl py-2 opacity-35">
              {inner}
            </div>
          ) : (
            <Link
              key={c}
              href={lp(lang, `/result/${isoToDMY(c)}`)}
              className={`flex flex-col items-center rounded-xl border py-2 transition hover:border-brand-2 hover:bg-surface-2 ${c === today ? "border-gold bg-gold-soft" : "border-transparent"}`}
              aria-label={fmt(t.archive.resultFor, { date: longDateL(t, c) })}
            >
              {inner}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-3 border-t border-line px-4 py-2.5 text-[0.72rem] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-gold-2" /> {t.archive.legend}
        </span>
      </div>
    </div>
  );
}
