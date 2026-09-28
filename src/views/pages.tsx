import type { Metadata } from "next";
import Link from "@/components/SiteLink";
import { getLastNDays } from "@/lib/results";
import { getSettings } from "@/lib/settings";
import { todayIST, weekdayOf } from "@/lib/time";
import { SLOTS, SLOT_META, TIERS } from "@/lib/draws";
import { fmt, getDict, lp, type Locale } from "@/lib/i18n";
import { alternates, ogLocale, urlFor } from "@/lib/i18n/seo";
import { checkerText } from "@/lib/i18n/ui";
import { PageHero } from "@/components/PageHero";
import { DaysTable } from "@/components/DaysTable";
import { FAQ } from "@/components/FAQ";
import { Ad } from "@/components/Ad";
import { Rich } from "@/components/Rich";
import { TicketChecker } from "@/components/TicketChecker";
import { SeriesChart } from "@/components/IndiaCompare";

export async function simpleMetadata(lang: Locale, path: string, title: string, description: string): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: alternates(lang, path),
    openGraph: { title, description, url: urlFor(lang, path), locale: ogLocale(lang) },
  };
}

/* ---------- 30-day chart ---------- */
export function chartMetadata(lang: Locale) {
  const t = getDict(lang);
  return simpleMetadata(lang, "/lottery-sambad-chart", t.chart.meta, t.chart.metaDesc);
}

export async function ChartView({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const c = t.chart;
  const days = await getLastNDays(todayIST(), 30);
  return (
    <>
      <PageHero lang={lang} crumbs={[{ name: c.crumb }]} eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />
      <div className="wrap mt-8 space-y-10">
        <DaysTable days={days} lang={lang} />
        <Ad slot="inContent" />
        {days.length > 0 && (
          <section>
            <h2 className="section-title">{c.freqTitle}</h2>
            <p className="mt-2 text-sm text-muted">{c.freqDesc}</p>
            <div className="card mt-5 p-5">
              <SeriesChart lang={lang} days={days} />
            </div>
          </section>
        )}
        <section className="prose-x">
          <h2>{c.howTitle}</h2>
          <p>
            <Rich text={c.how} lang={lang} />
          </p>
        </section>
      </div>
    </>
  );
}

/* ---------- draw schedule & prizes ---------- */
export function scheduleMetadata(lang: Locale) {
  const t = getDict(lang);
  return simpleMetadata(lang, "/lottery-sambad-draw-schedule", t.schedule.meta, t.schedule.metaDesc);
}

export async function ScheduleView({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const sc = t.schedule;
  const s = await getSettings();
  const wd = weekdayOf(todayIST());
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <>
      <PageHero lang={lang} crumbs={[{ name: sc.crumb }]} eyebrow={sc.eyebrow} title={sc.title} subtitle={sc.subtitle} />
      <div className="wrap mt-8 space-y-12">
        <section>
          <h2 className="section-title">{sc.namesTitle}</h2>
          <div className="card mt-5 overflow-x-auto">
            <table className="table-x min-w-[560px]">
              <thead>
                <tr>
                  <th>{sc.day}</th>
                  {SLOTS.map((x) => (
                    <th key={x}>{t.slots[x].time}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {order.map((d) => (
                  <tr key={d} className={d === wd ? "[&>td]:bg-gold-soft" : ""}>
                    <td className="font-bold">
                      {t.weekdays[d]} {d === wd && <span className="pill ml-1 bg-gold text-[#1c1400]">{sc.todayTag}</span>}
                    </td>
                    {SLOTS.map((x) => (
                      <td key={x}>Dear {s.schedule[x][d]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="section-title">{sc.timingsTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {SLOTS.map((x) => (
              <Link key={x} href={lp(lang, SLOT_META[x].path)} className="card p-5 hover:border-brand-2">
                <div className="eyebrow">{fmt(sc.periodDraw, { period: t.slots[x].period })}</div>
                <div className="mt-1 text-2xl font-extrabold">{t.slots[x].time}</div>
                <div className="mt-2 text-sm text-muted">{fmt(sc.resultAt, { x: t.slots[x].expected })}</div>
                <div className="text-sm text-muted">{fmt(sc.stateLbl, { s: t.states[SLOT_META[x].state] ?? SLOT_META[x].state })}</div>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="section-title">{sc.prizeTitle}</h2>
          <div className="card mt-5 overflow-x-auto">
            <table className="table-x min-w-[480px]">
              <thead>
                <tr>
                  <th>{sc.colPrize}</th>
                  <th>{sc.colAmount}</th>
                  <th>{sc.colCount}</th>
                  <th>{sc.colMatch}</th>
                </tr>
              </thead>
              <tbody>
                {TIERS.map((tier) => (
                  <tr key={tier.key}>
                    <td className="font-bold">{t.tiers[tier.key]}</td>
                    <td>
                      <span className="pill bg-gold-soft text-ink">{s.prizes[tier.key]}</span>
                    </td>
                    <td>{tier.expected}</td>
                    <td className="text-muted">{tier.key === "first" ? sc.matchFull : tier.key === "cons" ? sc.matchCons : fmt(sc.matchLast, { n: tier.digits })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">{sc.note}</p>
        </section>
        <FAQ items={sc.faq} title={t.common.faq} />
      </div>
    </>
  );
}

/* ---------- ticket checker ---------- */
export function checkerMetadata(lang: Locale) {
  const t = getDict(lang);
  return simpleMetadata(lang, "/check-ticket", t.checker.meta, t.checker.metaDesc);
}

export async function CheckerView({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const c = t.checker;
  const s = await getSettings();
  return (
    <>
      <PageHero lang={lang} crumbs={[{ name: c.crumb }]} eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} />
      <div className="wrap mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <TicketChecker today={todayIST()} prizes={s.prizes} t={checkerText(lang)} />
          <Ad slot="inContent" />
          <section className="prose-x">
            <h2>{c.howTitle}</h2>
            <ol>
              {c.how.map((x, i) => (
                <li key={i}>
                  <Rich text={x} lang={lang} />
                </li>
              ))}
            </ol>
            <p>{c.privacy}</p>
          </section>
          <FAQ items={c.faq} title={t.common.faq} />
        </div>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Ad slot="sidebar" />
        </aside>
      </div>
    </>
  );
}
