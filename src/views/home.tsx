import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, LineChart, Ticket, CalendarClock, Sparkles, Radio, Trophy, IndianRupee, MapPinned, Globe2 } from "lucide-react";
import { SLOTS, SLOT_META, drawNameFor } from "@/lib/draws";
import { getLastNDays, getResultsForDate } from "@/lib/results";
import { getSettings, siteUrl } from "@/lib/settings";
import { dotted, isoToDMY, todayIST } from "@/lib/time";
import { fingerprint } from "@/lib/live";
import { mediaUrl } from "@/lib/storage";
import { fmt, fullDateL, getDict, HREFLANG, longDateL, lp, shortDateL, weekdayL, type Locale } from "@/lib/i18n";
import { alternates, ogLocale, urlFor } from "@/lib/i18n/seo";
import { DrawCard } from "@/components/DrawCard";
import { LiveWatcher } from "@/components/LiveWatcher";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { Ad } from "@/components/Ad";
import { Rich } from "@/components/Rich";
import { ComparisonTable, LegalStates, PrizeChart, ReadMore, SeriesChart, TimelineChart } from "@/components/IndiaCompare";

export async function homeMetadata(lang: Locale): Promise<Metadata> {
  const t = getDict(lang);
  const s = await getSettings();
  const today = todayIST();
  const title = fmt(t.home.meta, { date: dotted(today) });
  const description = fmt(t.home.metaDesc, { date: longDateL(t, today) });
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: alternates(lang, "/"),
    openGraph: { title, description, url: urlFor(lang, "/"), locale: ogLocale(lang) },
  };
}

function SectionHead({ eyebrow, title, sub, action }: { eyebrow: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-3xl">
        <div className="eyebrow">{eyebrow}</div>
        <h2 className="section-title mt-1">{title}</h2>
        {sub && <p className="mt-2 text-sm leading-relaxed text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export async function HomeView({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const h = t.home;
  const L = (p: string) => lp(lang, p);
  const today = todayIST();
  const [s, draws, month] = await Promise.all([getSettings(), getResultsForDate(today), getLastNDays(today, 30)]);
  const week = month.slice(0, 7);
  const images = SLOTS.filter((x) => draws[x]?.imageKey);

  const stats = [
    { ...h.stats.draws, Icon: Radio },
    { ...h.stats.prize, Icon: Trophy },
    { ...h.stats.ticket, Icon: IndianRupee },
    { ...h.stats.states, Icon: MapPinned },
  ];
  const tools = [
    { href: "/check-ticket", ...h.tools.check, Icon: Ticket },
    { href: "/old-results", ...h.tools.old, Icon: CalendarDays },
    { href: "/lottery-sambad-chart", ...h.tools.chart, Icon: LineChart },
    { href: "/lottery-sambad-draw-schedule", ...h.tools.schedule, Icon: CalendarClock },
  ];

  return (
    <>
      <section className="hero">
        <div className="wrap pb-10 pt-8 md:pb-14 md:pt-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold backdrop-blur">
            <span className="live-dot" /> {h.live}
          </div>
          <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl md:text-[3.4rem]">
            {h.h1a} <span className="bg-gradient-to-r from-[#ffe27d] to-gold bg-clip-text text-transparent">{h.h1b}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-white/75 md:text-lg [&_strong]:text-white">
            <Rich text={fmt(h.sub, { date: fullDateL(t, today) })} lang={lang} />
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {SLOTS.map((x) => (
              <Link
                key={x}
                href={L(SLOT_META[x].path)}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-gold hover:text-[#1c1400]"
              >
                {fmt(h.slotBtn, { slot: t.slots[x].label })}
              </Link>
            ))}
            <Link href={L("/old-results")} className="rounded-full px-4 py-2 text-sm font-bold text-white/80 hover:text-white">
              {h.oldBtn}
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {SLOTS.map((x) => (
              <DrawCard key={x} slot={x} date={today} result={draws[x]} isToday schedule={s.schedule} firstAmount={s.prizes.first} lang={lang} />
            ))}
          </div>
        </div>
      </section>

      <div className="wrap">
        {/* KPI tiles */}
        <section className="mt-8" aria-label={h.statsEyebrow}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map(({ v, l, Icon }) => (
              <div key={l} className="card flex items-center gap-3 p-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold-2">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="text-xl font-extrabold leading-tight tabular-nums sm:text-2xl">{v}</div>
                  <div className="text-xs leading-snug text-muted">{l}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Ad slot="inContent" className="pt-8" />

        {images.length > 0 && (
          <section className="mt-12">
            <SectionHead
              eyebrow={h.imagesEyebrow}
              title={h.imagesTitle}
              action={
                <Link href={L("/lottery-sambad-today")} className="hidden text-sm font-bold text-brand-2 sm:block">
                  {h.allToday}
                </Link>
              }
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {images.map((x) => (
                <Link key={x} href={L(`/result/${isoToDMY(today)}/${x}`) + "#result-image"} className="card group overflow-hidden">
                  <div className="aspect-[4/5] overflow-hidden bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl(draws[x]!.imageKey)!}
                      alt={fmt(t.result.title, { slot: t.slots[x].label, date: longDateL(t, today) })}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full bg-white object-contain object-top transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 text-sm font-bold">
                    {t.slots[x].time} · {shortDateL(t, today)} <ArrowRight className="size-4 text-brand-2" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* last 7 days */}
        <section className="mt-12">
          <SectionHead
            eyebrow={h.weekEyebrow}
            title={h.weekTitle}
            action={
              <Link href={L("/lottery-sambad-chart")} className="text-sm font-bold text-brand-2">
                {h.fullChart}
              </Link>
            }
          />
          <div className="card mt-5 overflow-x-auto">
            <table className="table-x min-w-[560px]">
              <thead>
                <tr>
                  <th>{t.common.date}</th>
                  {SLOTS.map((x) => (
                    <th key={x}>{t.slots[x].label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {week.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted">
                      {h.weekEmpty}
                    </td>
                  </tr>
                )}
                {week.map((d) => (
                  <tr key={d.date}>
                    <td className="whitespace-nowrap">
                      <Link href={L(`/result/${isoToDMY(d.date)}`)} className="font-bold hover:text-brand-2">
                        {shortDateL(t, d.date)}
                      </Link>
                      <div className="text-xs text-muted">{weekdayL(t, d.date)}</div>
                    </td>
                    {SLOTS.map((x) => (
                      <td key={x}>
                        {d.draws[x]?.firstPrize ? (
                          <Link
                            href={L(`/result/${isoToDMY(d.date)}/${x}`)}
                            className="num rounded-lg bg-gold-soft px-2 py-1 font-extrabold hover:bg-gold hover:text-[#1c1400]"
                          >
                            {d.draws[x]!.firstPrize}
                          </Link>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map(({ href, t: title, d, Icon }) => (
            <Link key={href} href={L(href)} className="card group p-5 transition hover:-translate-y-0.5 hover:border-brand-2">
              <span className="grid size-11 place-items-center rounded-2xl bg-navy text-gold transition group-hover:bg-gold group-hover:text-navy">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-extrabold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </Link>
          ))}
        </section>

        {/* timings */}
        <section className="mt-12">
          <SectionHead eyebrow={h.timingsEyebrow} title={h.timingsTitle} />
          <div className="card mt-5 overflow-x-auto">
            <table className="table-x min-w-[600px]">
              <thead>
                <tr>
                  <th>{h.colDraw}</th>
                  <th>{fmt(h.colName, { day: weekdayL(t, today) })}</th>
                  <th>{h.colTime}</th>
                  <th>{h.colResult}</th>
                  <th>{h.colState}</th>
                </tr>
              </thead>
              <tbody>
                {SLOTS.map((x) => (
                  <tr key={x}>
                    <td>
                      <Link href={L(SLOT_META[x].path)} className="font-bold text-brand-2 hover:underline">
                        {fmt(h.slotLink, { slot: t.slots[x].label })}
                      </Link>
                    </td>
                    <td>{draws[x]?.drawName ?? drawNameFor(x, today, s.schedule)}</td>
                    <td className="font-semibold">{t.slots[x].time}</td>
                    <td className="text-muted">{t.slots[x].expected}</td>
                    <td>{t.states[SLOT_META[x].state] ?? SLOT_META[x].state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* series letters from our archive */}
        {month.length > 0 && (
          <section className="mt-12">
            <SectionHead eyebrow={h.seriesEyebrow} title={h.seriesTitle} sub={h.seriesDesc} />
            <div className="card mt-5 p-5">
              <SeriesChart lang={lang} days={month} />
            </div>
          </section>
        )}

        {/* all-India comparison */}
        <section className="mt-14" id="indian-lotteries">
          <SectionHead
            eyebrow={t.india.eyebrow}
            title={t.india.homeTitle}
            sub={t.india.homeSub}
            action={
              <span className="hidden sm:block">
                <ReadMore lang={lang} />
              </span>
            }
          />
          <div className="mt-5">
            <ComparisonTable lang={lang} />
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="card p-5">
              <h3 className="font-extrabold">{t.india.chartPrizeTitle}</h3>
              <p className="mb-4 mt-1 text-xs text-muted">{t.india.chartPrizeDesc}</p>
              <PrizeChart lang={lang} />
            </div>
            <div className="card p-5">
              <h3 className="font-extrabold">{t.india.chartTimeTitle}</h3>
              <p className="mb-4 mt-1 text-xs text-muted">{t.india.chartTimeDesc}</p>
              <TimelineChart lang={lang} />
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">{t.india.note}</p>
          <div className="mt-4 sm:hidden">
            <ReadMore lang={lang} />
          </div>
        </section>

        <Ad slot="inContent" className="pt-10" />

        {/* long-form content */}
        <section className="prose-x mt-12 max-w-none">
          <h2>{h.contentTitle}</h2>
          {h.content.map((p, i) => (
            <p key={i}>
              <Rich text={p} lang={lang} />
            </p>
          ))}
          <h3>{h.whyTitle}</h3>
          <ul>
            {h.why.map((x, i) => (
              <li key={i}>
                <Rich text={x} lang={lang} />
              </li>
            ))}
          </ul>
          <h2>{t.india.faxTitle}</h2>
          <p>
            <Rich text={t.india.faxText} lang={lang} />
          </p>
          <h2>{t.india.legalTitle}</h2>
          <p>
            <Rich text={t.india.legalText} lang={lang} />
          </p>
        </section>
        <div className="mt-5">
          <LegalStates lang={lang} compact />
        </div>
        <div className="prose-x mt-8 max-w-none">
          <h3>{t.india.responsibleTitle}</h3>
          <p>{t.india.responsibleText}</p>
          <blockquote>{h.disclaimer}</blockquote>
        </div>

        <FAQ items={h.faq} title={t.common.faq} />

        <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-br from-navy to-navy-2 p-8 text-center text-white">
          <Sparkles className="size-7 text-gold" />
          <h2 className="text-xl font-extrabold">{h.ctaTitle}</h2>
          <p className="max-w-md text-sm text-white/70">{h.ctaText}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Link href={L("/lottery-sambad-today")} className="btn btn-gold">
              {h.ctaBtn} <ArrowRight className="size-4" />
            </Link>
            <Link href={L("/indian-lotteries")} className="btn border border-white/20 text-white hover:bg-white/10">
              <Globe2 className="size-4" /> {t.nav.lotteries}
            </Link>
          </div>
        </div>
      </div>

      <LiveWatcher date={today} have={{ "1pm": fingerprint(draws["1pm"]), "6pm": fingerprint(draws["6pm"]), "8pm": fingerprint(draws["8pm"]) }} />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: s.siteName,
            alternateName: "Lottery Sambad Plus",
            url: siteUrl() + "/",
            inLanguage: ["en-IN", "hi-IN", "bn-IN", "ml-IN"],
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: s.siteName,
            url: siteUrl() + "/",
            logo: siteUrl() + "/icon-512.png",
            email: s.contactEmail,
            sameAs: Object.values(s.social).filter(Boolean),
          },
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: fmt(t.home.meta, { date: dotted(today) }),
            url: urlFor(lang, "/"),
            inLanguage: HREFLANG[lang],
          },
        ]}
      />
    </>
  );
}
