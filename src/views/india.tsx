import Link from "@/components/SiteLink";
import { ShieldAlert, Printer, Landmark } from "lucide-react";
import { KERALA_BUMPERS, KERALA_WEEKLY, LOTTERIES } from "@/lib/lotteries";
import { todayIST, weekdayOf } from "@/lib/time";
import { fmt, getDict, lp, type Locale } from "@/lib/i18n";
import { lotteryText, stateName } from "@/lib/i18n/lotteryText";
import { PageHero } from "@/components/PageHero";
import { FAQ } from "@/components/FAQ";
import { Ad } from "@/components/Ad";
import { Rich } from "@/components/Rich";
import { ComparisonTable, LegalStates, PrizeChart, TimelineChart } from "@/components/IndiaCompare";
import { simpleMetadata } from "./pages";

export function indiaMetadata(lang: Locale) {
  const t = getDict(lang);
  return simpleMetadata(lang, "/indian-lotteries", t.india.meta, t.india.metaDesc);
}

export function IndiaView({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const i = t.india;
  const lt = lotteryText(lang);
  const wd = weekdayOf(todayIST());
  return (
    <>
      <PageHero lang={lang} crumbs={[{ name: i.crumb }]} eyebrow={i.eyebrow} title={i.title} subtitle={i.subtitle} />
      <div className="wrap mt-8 space-y-12">
        <section>
          <h2 className="section-title">{i.tableTitle}</h2>
          <div className="mt-5">
            <ComparisonTable lang={lang} />
          </div>
          <p className="mt-3 text-xs text-muted">{i.note}</p>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="card p-5">
            <h2 className="text-lg font-extrabold">{i.chartPrizeTitle}</h2>
            <p className="mb-4 mt-1 text-xs text-muted">{i.chartPrizeDesc}</p>
            <PrizeChart lang={lang} />
          </div>
          <div className="card p-5">
            <h2 className="text-lg font-extrabold">{i.chartTimeTitle}</h2>
            <p className="mb-4 mt-1 text-xs text-muted">{i.chartTimeDesc}</p>
            <TimelineChart lang={lang} />
          </div>
        </section>

        <Ad slot="inContent" />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {LOTTERIES.map((l) => {
            const row = lt.rows[l.id];
            return (
              <article key={l.id} className="card flex flex-col p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                  <Landmark className="size-4 text-gold-2" /> {stateName(lang, l.state)}
                </div>
                <h3 className="mt-1 text-lg font-extrabold leading-snug">{row.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{i.about[l.id]}</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-surface-2 p-2.5">
                    <dt className="text-muted">{i.col.times}</dt>
                    <dd className="mt-0.5 font-bold tabular-nums">{row.times}</dd>
                  </div>
                  <div className="rounded-xl bg-surface-2 p-2.5">
                    <dt className="text-muted">{i.col.ticket}</dt>
                    <dd className="mt-0.5 font-bold">{row.ticket}</dd>
                  </div>
                  <div className="col-span-2 rounded-xl bg-gold-soft p-2.5">
                    <dt className="text-muted">{i.col.bumper}</dt>
                    <dd className="mt-0.5 font-bold">{row.bumper}</dd>
                  </div>
                </dl>
                {l.link && (
                  <Link href={lp(lang, l.link)} className="mt-4 text-sm font-bold text-brand-2 hover:underline">
                    {i.results} →
                  </Link>
                )}
              </article>
            );
          })}
        </section>

        <section>
          <h2 className="section-title">{i.keralaTitle}</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="card overflow-x-auto">
              <h3 className="border-b border-line bg-surface-2 px-4 py-3 font-extrabold">{i.keralaWeekly}</h3>
              <table className="table-x">
                <thead>
                  <tr>
                    <th>{t.schedule.day}</th>
                    <th>{i.col.lottery}</th>
                  </tr>
                </thead>
                <tbody>
                  {KERALA_WEEKLY.map((k) => (
                    <tr key={k.name} className={k.day === wd ? "[&>td]:bg-gold-soft" : ""}>
                      <td className="font-semibold">
                        {t.weekdays[k.day]} {k.day === wd && <span className="pill ml-1 bg-gold text-[#1c1400]">{t.schedule.todayTag}</span>}
                      </td>
                      <td>
                        {lt.kerala?.[k.name] ? (
                          <>
                            {lt.kerala[k.name]} <span className="text-xs text-muted">({k.name})</span>
                          </>
                        ) : (
                          k.name
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card overflow-x-auto">
              <h3 className="border-b border-line bg-surface-2 px-4 py-3 font-extrabold">{i.keralaBumpers}</h3>
              <table className="table-x">
                <thead>
                  <tr>
                    <th>{i.month}</th>
                    <th>{t.schedule.colPrize}</th>
                    <th className="text-right">{t.schedule.colAmount}</th>
                  </tr>
                </thead>
                <tbody>
                  {KERALA_BUMPERS.map((b) => (
                    <tr key={b.key}>
                      <td className="whitespace-nowrap font-semibold">{t.months[b.month - 1]}</td>
                      <td>{lt.prizes[b.key]}</td>
                      <td className="whitespace-nowrap text-right font-bold tabular-nums">{fmt(i.crore, { n: b.crore })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <h2 className="section-title">{i.legalTitle}</h2>
          <p className="mt-3 max-w-4xl text-[0.97rem] leading-relaxed text-muted [&_strong]:text-ink">
            <Rich text={i.legalText} lang={lang} />
          </p>
          <div className="mt-5">
            <LegalStates lang={lang} />
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <Printer className="size-5 shrink-0 text-brand-2" /> {i.faxTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted [&_strong]:text-ink">
              <Rich text={i.faxText} lang={lang} />
            </p>
          </div>
          <div className="card border-gold/50 bg-gold-soft/40 p-6">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <ShieldAlert className="size-5 shrink-0 text-gold-2" /> {i.responsibleTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{i.responsibleText}</p>
          </div>
        </section>

        <FAQ items={i.faq} title={t.common.faq} />
      </div>
    </>
  );
}
