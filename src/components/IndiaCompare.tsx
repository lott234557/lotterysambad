import Link from "@/components/SiteLink";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { SLOTS } from "@/lib/draws";
import type { DayRow } from "@/lib/results";
import { BANNED_STATES, DAILY_DRAWS, LEGAL_STATES, LOTTERIES, TOP_PRIZES } from "@/lib/lotteries";
import { fmt, getDict, lp, type Dict, type Locale } from "@/lib/i18n";
import { lotteryText, stateName } from "@/lib/i18n/lotteryText";
import { HBarChart } from "./charts/HBarChart";
import { ColumnChart } from "./charts/ColumnChart";
import { DayTimeline } from "./charts/DayTimeline";

const pad = (n: number) => String(n).padStart(2, "0");
export const clock = (t: Dict, minute: number) => {
  const h = Math.floor(minute / 60);
  return `${h % 12 || 12}:${pad(minute % 60)} ${h < 12 ? t.am : t.pm}`;
};

/** Comparison table of Indian state lotteries. */
export function ComparisonTable({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const lt = lotteryText(lang);
  const c = t.india.col;
  return (
    <div className="card overflow-x-auto">
      <table className="table-x min-w-[760px]">
        <thead>
          <tr>
            <th className="min-w-[13rem]">{c.lottery}</th>
            <th>{c.times}</th>
            <th className="text-right">{c.perWeek}</th>
            <th>{c.ticket}</th>
            <th>{c.top}</th>
            <th>{c.bumper}</th>
          </tr>
        </thead>
        <tbody>
          {LOTTERIES.map((l) => {
            const row = lt.rows[l.id];
            const sambad = l.id === "sambad" || l.id === "sikkim";
            return (
              <tr key={l.id} className={sambad ? "[&>td]:bg-gold-soft/60" : ""}>
                <td>
                  <div className="flex items-start gap-2">
                    <span className={`mt-1.5 inline-block size-2.5 shrink-0 rounded-[3px] ${sambad ? "bg-chart-2" : "bg-chart-1"}`} aria-hidden />
                    <div>
                      <div className="font-extrabold">{row.name}</div>
                      <div className="text-xs text-muted">{stateName(lang, l.state)}</div>
                      {l.link && (
                        <Link href={lp(lang, l.link)} className="text-xs font-bold text-brand-2 hover:underline">
                          {t.india.results} →
                        </Link>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap font-semibold tabular-nums">{row.times}</td>
                <td className="text-right font-bold tabular-nums">{l.drawsPerWeek ?? <span className="text-xs font-semibold text-muted">{t.india.perWeekNA}</span>}</td>
                <td className="whitespace-nowrap">{row.ticket}</td>
                <td>{row.top}</td>
                <td className="text-muted">{row.bumper}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function legendFor(t: Dict) {
  return [
    { label: t.india.legendSambad, series: 1 as const },
    { label: t.india.legendOther, series: 0 as const },
  ];
}

/** Biggest first prizes, ₹ crore. */
export function PrizeChart({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const lt = lotteryText(lang);
  const rows = TOP_PRIZES.map((p) => ({
    label: lt.prizes[p.key],
    value: p.crore,
    display: fmt(t.india.crore, { n: p.crore }),
    series: (p.sambad ? 1 : 0) as 0 | 1,
  }));
  return (
    <HBarChart
      rows={rows}
      ticks={[0, 10, 20, 30]}
      tickLabel={(n) => String(n)}
      legend={legendFor(t)}
      label={t.india.chartPrizeTitle}
      table={{ summary: t.common.table, head: [t.schedule.colPrize, t.schedule.colAmount] }}
    />
  );
}

/** When results come out during the day. */
export function TimelineChart({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const lt = lotteryText(lang);
  return (
    <DayTimeline
      events={DAILY_DRAWS.map((d) => ({
        minute: d.minute,
        label: lt.draws[d.key],
        time: clock(t, d.minute),
        series: d.sambad ? 1 : 0,
        href: d.href ? lp(lang, d.href) : undefined,
      }))}
      hourLabel={(h) => `${h % 12 || 12} ${h < 12 ? t.am : t.pm}`}
      legend={legendFor(t)}
      label={t.india.chartTimeTitle}
      table={{ summary: t.common.table, head: [t.india.col.lottery, t.home.colTime] }}
    />
  );
}

/** Legal / banned states as chips. */
export function LegalStates({ lang, compact = false }: { lang: Locale; compact?: boolean }) {
  const t = getDict(lang);
  return (
    <div className={`grid gap-4 ${compact ? "" : "md:grid-cols-2"}`}>
      <div className="card p-5">
        <h3 className="flex items-center gap-2 font-extrabold">
          <CheckCircle2 className="size-5 text-ok" /> {t.india.legalStates} <span className="pill bg-ok/10 text-ok">{LEGAL_STATES.length}</span>
        </h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {LEGAL_STATES.map((s) => (
            <li key={s} className="rounded-lg border border-ok/30 bg-ok/5 px-2.5 py-1 text-xs font-semibold">
              {stateName(lang, s)}
            </li>
          ))}
        </ul>
      </div>
      {!compact && (
        <div className="card p-5">
          <h3 className="flex items-center gap-2 font-extrabold">
            <XCircle className="size-5 text-live" /> {t.india.bannedStates}
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {BANNED_STATES.map((s) => (
              <li key={s} className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-xs font-semibold text-muted">
                {stateName(lang, s)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Series-letter frequency of first prizes over the given days (from our archive). */
export function SeriesChart({ lang, days }: { lang: Locale; days: DayRow[] }) {
  const t = getDict(lang);
  const freq = new Map<string, number>();
  for (const d of days)
    for (const s of SLOTS) {
      const f = d.draws[s]?.firstPrize;
      if (f) {
        const letter = f.split(" ")[0].slice(-1);
        freq.set(letter, (freq.get(letter) ?? 0) + 1);
      }
    }
  if (!freq.size) return null;
  const cols = Array.from(freq.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([l, n]) => ({ label: l, value: n, tip: `${t.chart.colSeries} ${l}: ${fmt(t.chart.wins, { n })}` }));
  return <ColumnChart cols={cols} label={t.chart.freqTitle} table={{ summary: t.common.table, head: [t.chart.colSeries, t.chart.colWins] }} />;
}

export function ReadMore({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  return (
    <Link href={lp(lang, "/indian-lotteries")} className="inline-flex items-center gap-1 text-sm font-bold text-brand-2 transition-all hover:gap-2">
      {t.india.readMore.replace(/\s*→$/, "")} <ArrowRight className="size-4" />
    </Link>
  );
}
