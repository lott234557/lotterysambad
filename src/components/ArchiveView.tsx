import Link from "next/link";
import { getArchiveMonths, getMonth } from "@/lib/results";
import { todayIST } from "@/lib/time";
import { fmt, getDict, lp, monthLabelL, type Locale } from "@/lib/i18n";
import { dateJumpText } from "@/lib/i18n/ui";
import { PageHero } from "./PageHero";
import { LotteryPills } from "./LotteryPills";
import { MonthCalendar } from "./MonthCalendar";
import { DaysTable } from "./DaysTable";
import { DateJump } from "./DateJump";
import { Ad } from "./Ad";

export async function ArchiveView({ month, isIndex, lang = "en" }: { month: string; isIndex: boolean; lang?: Locale }) {
  const t = getDict(lang);
  const a = t.archive;
  const today = todayIST();
  const [days, months] = await Promise.all([getMonth(month), getArchiveMonths()]);
  const label = monthLabelL(t, month);
  return (
    <>
      <PageHero
        lang={lang}
        crumbs={isIndex ? [{ name: a.crumb }] : [{ name: a.crumb, href: lp(lang, "/old-results") }, { name: label }]}
        eyebrow={a.eyebrow}
        title={isIndex ? a.titleIndex : fmt(a.titleMonth, { month: label })}
        subtitle={isIndex ? a.subIndex : fmt(a.subMonth, { month: label })}
      >
        <LotteryPills lang={lang} className="mt-6" />
      </PageHero>
      <div className="wrap mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <MonthCalendar month={month} days={days} today={today} lang={lang} />
          <Ad slot="inContent" />
          <section>
            <h2 className="section-title">{fmt(a.dayWise, { month: label })}</h2>
            <div className="mt-5">
              <DaysTable days={days} empty={fmt(a.noResults, { month: label })} lang={lang} />
            </div>
          </section>
        </div>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-4">
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-muted">{a.goTo}</h2>
            <DateJump max={today} t={dateJumpText(lang)} />
          </div>
          <div className="card p-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-muted">{a.months}</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {months.length === 0 && <li className="col-span-2 text-muted">{a.noArchive}</li>}
              {months.map((m) => (
                <li key={m.key}>
                  <Link
                    href={lp(lang, `/old-results/${m.key}`)}
                    className={`block rounded-lg border px-3 py-2 font-semibold hover:border-brand-2 ${m.key === month ? "border-gold bg-gold-soft" : "border-line"}`}
                  >
                    {monthLabelL(t, m.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Ad slot="sidebar" />
        </aside>
      </div>
    </>
  );
}
