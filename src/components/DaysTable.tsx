import Link from "next/link";
import { SLOTS } from "@/lib/draws";
import type { DayRow } from "@/lib/results";
import { isoToDMY } from "@/lib/time";
import { fmt, getDict, lp, shortDateL, weekdayL, type Locale } from "@/lib/i18n";

export function DaysTable({ days, empty, lang = "en" }: { days: DayRow[]; empty?: string; lang?: Locale }) {
  const t = getDict(lang);
  return (
    <div className="card overflow-x-auto">
      <table className="table-x min-w-[600px]">
        <thead>
          <tr>
            <th>{t.common.date}</th>
            {SLOTS.map((x) => (
              <th key={x}>{fmt(t.archive.slotFirst, { slot: t.slots[x].label })}</th>
            ))}
            <th className="text-right">{t.common.full}</th>
          </tr>
        </thead>
        <tbody>
          {days.length === 0 && (
            <tr>
              <td colSpan={5} className="py-10 text-center text-muted">{empty ?? t.archive.empty}</td>
            </tr>
          )}
          {days.map((d) => (
            <tr key={d.date}>
              <td className="whitespace-nowrap">
                <b>{shortDateL(t, d.date)}</b>
                <div className="text-xs text-muted">{weekdayL(t, d.date)}</div>
              </td>
              {SLOTS.map((x) => (
                <td key={x}>
                  {d.draws[x]?.firstPrize ? (
                    <Link href={lp(lang, `/result/${isoToDMY(d.date)}/${x}`)} className="num rounded-lg bg-gold-soft px-2 py-1 font-extrabold hover:bg-gold hover:text-[#1c1400]">
                      {d.draws[x]!.firstPrize}
                    </Link>
                  ) : d.draws[x] ? (
                    <Link href={lp(lang, `/result/${isoToDMY(d.date)}/${x}`)} className="text-xs font-semibold text-brand-2">
                      {t.common.image}
                    </Link>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              ))}
              <td className="text-right">
                <Link href={lp(lang, `/result/${isoToDMY(d.date)}`)} className="font-bold text-brand-2 hover:underline">
                  {t.common.view}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
