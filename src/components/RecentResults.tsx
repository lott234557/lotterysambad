import Link from "@/components/SiteLink";
import type { Result } from "@/lib/db/schema";
import type { Slot } from "@/lib/draws";
import { isoToDMY } from "@/lib/time";
import { getDict, lp, shortDateL, weekdayL, type Locale } from "@/lib/i18n";

export function RecentResults({ rows, title, showSlot = false, lang = "en" }: { rows: Result[]; title: string; showSlot?: boolean; lang?: Locale }) {
  if (!rows.length) return null;
  const t = getDict(lang);
  return (
    <section className="mt-12">
      <h2 className="section-title">{title}</h2>
      <div className="card mt-5 overflow-x-auto">
        <table className="table-x min-w-[520px]">
          <thead>
            <tr>
              <th>{t.common.date}</th>
              {showSlot && <th>{t.common.draw}</th>}
              <th>{t.common.drawName}</th>
              <th>{t.common.firstPrize}</th>
              <th className="text-right">{t.common.result}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="whitespace-nowrap">
                  <b>{shortDateL(t, r.drawDate)}</b>
                  <div className="text-xs text-muted">{weekdayL(t, r.drawDate)}</div>
                </td>
                {showSlot && <td className="font-semibold">{t.slots[r.slot as Slot].label}</td>}
                <td className="text-muted">{r.drawName}</td>
                <td>
                  <span className="num rounded-lg bg-gold-soft px-2 py-1 font-extrabold">{r.firstPrize ?? "—"}</span>
                </td>
                <td className="text-right">
                  <Link href={lp(lang, `/result/${isoToDMY(r.drawDate)}/${r.slot}`)} className="font-bold text-brand-2 hover:underline">
                    {t.common.view}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
