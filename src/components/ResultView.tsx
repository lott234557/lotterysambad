import Link from "next/link";
import { CalendarDays, Clock3, Landmark, Hash, RefreshCw, ChevronLeft, ChevronRight, Ticket, TrendingUp } from "lucide-react";
import { SLOTS, SLOT_META, drawNameFor, type Slot } from "@/lib/draws";
import type { Result } from "@/lib/db/schema";
import type { SiteSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/settings";
import { dotted, isoToDMY, isoWithIST, nowIST, todayIST } from "@/lib/time";
import { getNeighbours, getRecentBySlot, getResultsForDate, getSeriesStats } from "@/lib/results";
import { fmt, formatISTL, fullDateL, getDict, HREFLANG, longDateL, lp, shortDateL, type Locale } from "@/lib/i18n";
import { prizeVars, resultSummary, slotFaqs } from "@/lib/i18n/content";
import { dateJumpText, finderText, shareText, statusText } from "@/lib/i18n/ui";
import { renderMarkdown } from "@/lib/markdown";
import { mediaUrl } from "@/lib/storage";
import { fingerprint } from "@/lib/live";
import { PageHero } from "./PageHero";
import { PrizeTiers } from "./PrizeTiers";
import { FirstPrize } from "./FirstPrize";
import { NumberFinder } from "./NumberFinder";
import { ResultImage } from "./ResultImage";
import { ShareBar } from "./ShareBar";
import { DrawStatus } from "./DrawStatus";
import { LiveWatcher } from "./LiveWatcher";
import { RecentResults } from "./RecentResults";
import { FAQ } from "./FAQ";
import { JsonLd } from "./JsonLd";
import { Ad } from "./Ad";
import { DateJump } from "./DateJump";
import { Rich } from "./Rich";

export async function ResultView({
  date,
  slot,
  result,
  settings: s,
  live = false,
  lang = "en",
}: {
  date: string;
  slot: Slot;
  result: Result | null;
  settings: SiteSettings;
  live?: boolean;
  lang?: Locale;
}) {
  const t = getDict(lang);
  const L = (p: string) => lp(lang, p);
  const m = SLOT_META[slot];
  const ts = t.slots[slot];
  const today = todayIST();
  const isToday = date === today;
  const name = result?.drawName || drawNameFor(slot, date, s.schedule);
  const canonicalPath = live ? m.path : `/result/${isoToDMY(date)}/${slot}`;
  const url = siteUrl() + L(canonicalPath);
  const title = fmt(live ? t.result.titleLive : t.result.title, { slot: ts.label, date: dotted(date) });
  const stateEn = result?.state ?? m.state;
  const state = t.states[stateEn] ?? stateEn;
  const navLabel = { "1pm": t.nav.r1, "6pm": t.nav.r6, "8pm": t.nav.r8 }[slot];

  const [recent, sameDay, nb, series] = await Promise.all([
    getRecentBySlot(slot, 10, date),
    getResultsForDate(date),
    getNeighbours(date),
    result?.firstPrize ? getSeriesStats(result.firstPrize.split(" ")[0], date) : Promise.resolve([]),
  ]);

  const hasData = !!(result && (result.firstPrize || result.imageKey));
  const imgAlt = `${fmt(t.result.title, { slot: ts.label, date: longDateL(t, date) })} – ${name}`;
  const summary = result && hasData ? resultSummary(lang, result, s.prizes.first) : "";
  const seriesLetter = result?.firstPrize?.split(" ")[0] ?? "";
  const updatedSameDay = !!result?.updatedAt && nowIST(new Date(result.updatedAt).getTime()).iso === date;

  return (
    <>
      <PageHero
        lang={lang}
        crumbs={
          live
            ? [{ name: navLabel }]
            : [
                { name: t.archive.crumb, href: L("/old-results") },
                { name: dotted(date), href: L(`/result/${isoToDMY(date)}`) },
                { name: ts.label },
              ]
        }
        eyebrow={
          isToday && !result?.isComplete ? (
            <>
              <span className="live-dot" /> {fmt(t.result.eyebrowLive, { time: ts.time })}
            </>
          ) : (
            <>{fmt(t.result.eyebrow, { time: ts.time })}</>
          )
        }
        title={title}
        subtitle={
          <>
            {fmt(t.result.subtitle, { name, period: ts.period, date: fullDateL(t, date) })}
            {isToday ? t.result.subtitleLive : "."}
          </>
        }
      >
        <div className="mt-6 flex flex-wrap gap-2 text-[0.78rem] font-semibold">
          <Meta icon={<CalendarDays className="size-3.5" />}>{shortDateL(t, date)}</Meta>
          <Meta icon={<Clock3 className="size-3.5" />}>{ts.time} IST</Meta>
          <Meta icon={<Landmark className="size-3.5" />}>{fmt(t.common.stateLottery, { state })}</Meta>
          {result?.drawNo && <Meta icon={<Hash className="size-3.5" />}>{fmt(t.common.drawNo, { n: result.drawNo })}</Meta>}
          {hasData && updatedSameDay && <Meta icon={<RefreshCw className="size-3.5" />}>{fmt(t.common.updated, { t: formatISTL(t, result!.updatedAt) })}</Meta>}
        </div>
      </PageHero>

      <div className="wrap mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {!hasData && (
            <div className="card p-5 sm:p-8">
              {isToday ? <DrawStatus date={date} slot={slot} t={statusText(lang, slot)} /> : <p className="text-center text-muted">{t.result.notAvail}</p>}
            </div>
          )}

          {!hasData && recent[0]?.firstPrize && (
            <Link
              href={L(`/result/${isoToDMY(recent[0].drawDate)}/${slot}`)}
              className="card group flex flex-col items-center gap-4 p-5 hover:border-brand-2 sm:flex-row sm:justify-between"
            >
              <div>
                <div className="eyebrow">{fmt(t.result.lastDeclared, { slot: ts.label })}</div>
                <div className="mt-1 font-extrabold">
                  {fullDateL(t, recent[0].drawDate)} · {recent[0].drawName}
                </div>
                <div className="mt-1 text-sm font-bold text-brand-2 group-hover:underline">{t.result.seeFull}</div>
              </div>
              <div className="w-full max-w-[280px]">
                <FirstPrize number={recent[0].firstPrize} amount={s.prizes.first} label={t.tiers.first} awaiting={t.prize.awaiting} />
              </div>
            </Link>
          )}

          {result && hasData && (
            <>
              <p className="text-[0.98rem] leading-relaxed text-muted">{summary}</p>
              <Ad slot="resultTop" />
              {result.firstPrize && <NumberFinder data={result} prizes={s.prizes} t={finderText(lang)} />}
              {result.firstPrize ? (
                <PrizeTiers result={result} prizes={s.prizes} lang={lang} middle={<Ad slot="resultMiddle" className="pt-4" />} />
              ) : (
                <div className="card flex items-center gap-3 p-5 text-sm font-semibold">
                  <span className="live-dot" /> {t.result.imageOnly}
                </div>
              )}
              <ResultImage
                result={result}
                alt={imgAlt}
                lang={lang}
                credit={s.showImageCredit && result.imageSourceUrl ? new URL(result.imageSourceUrl).hostname : null}
                priority={!result.firstPrize}
              />
              <Ad slot="resultBottom" />
              <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-bold">{t.share.title}</span>
                <ShareBar url={url} title={`${title}${result.firstPrize ? ` – ${t.tiers.first} ${result.firstPrize}` : ""}`} t={shareText(lang)} />
              </div>
            </>
          )}

          {/* prev / next */}
          <div className="grid grid-cols-2 gap-3">
            {nb.prev ? (
              <Link href={L(`/result/${isoToDMY(nb.prev)}/${slot}`)} className="card flex items-center gap-2 p-4 text-sm font-bold hover:border-brand-2">
                <ChevronLeft className="size-4 shrink-0" />
                <span>
                  <span className="block text-xs font-semibold text-muted">{t.common.previous}</span>
                  {ts.label} · {shortDateL(t, nb.prev)}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {nb.next ? (
              <Link href={L(`/result/${isoToDMY(nb.next)}/${slot}`)} className="card flex items-center justify-end gap-2 p-4 text-right text-sm font-bold hover:border-brand-2">
                <span>
                  <span className="block text-xs font-semibold text-muted">{t.common.next}</span>
                  {ts.label} · {shortDateL(t, nb.next)}
                </span>
                <ChevronRight className="size-4 shrink-0" />
              </Link>
            ) : (
              <span />
            )}
          </div>

          {result?.firstPrize && (
            <section className="card p-5">
              <h2 className="flex items-center gap-2 text-lg font-extrabold">
                <TrendingUp className="size-5 shrink-0 text-gold-2" /> {fmt(t.result.seriesTitle, { s: seriesLetter })}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {series.length ? fmt(t.result.seriesYes, { s: seriesLetter, n: series.length }) : fmt(t.result.seriesNo, { s: seriesLetter })}
              </p>
              {series.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {series.slice(0, 8).map((x) => (
                    <Link
                      key={x.drawDate + x.slot}
                      href={L(`/result/${isoToDMY(x.drawDate)}/${x.slot}`)}
                      className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold hover:border-brand-2"
                    >
                      <span className="num">{x.firstPrize}</span> · {shortDateL(t, x.drawDate)} {t.slots[x.slot as Slot].label}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {result?.notes && <div className="prose-x card p-5 sm:p-7" dangerouslySetInnerHTML={{ __html: renderMarkdown(result.notes) }} />}

          <RecentResults rows={recent} title={fmt(t.result.previousResults, { slot: ts.label })} lang={lang} />

          <section className="prose-x mt-12">
            <h2>{fmt(t.result.about, { slot: ts.label, period: ts.period })}</h2>
            <p>{t.result.intro[slot]}</p>
            <h3>{t.result.prizeTitle}</h3>
            <p>
              <Rich text={fmt(t.result.prizeText, prizeVars(s.prizes))} lang={lang} />
            </p>
            <h3>{t.result.howTitle}</h3>
            <ol>
              {t.result.how.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ol>
          </section>

          <FAQ items={slotFaqs(lang, slot, s.prizes)} title={t.common.faq} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-muted">{fmt(t.result.allDraws, { date: shortDateL(t, date) })}</h2>
            <ul className="mt-3 space-y-2">
              {SLOTS.map((x) => {
                const r = sameDay[x];
                const on = x === slot;
                return (
                  <li key={x}>
                    <Link
                      href={L(isToday ? SLOT_META[x].path : `/result/${isoToDMY(date)}/${x}`)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${on ? "border-gold bg-gold-soft" : "border-line hover:border-brand-2"}`}
                    >
                      <span className="font-bold">{t.slots[x].time}</span>
                      <span className="num font-extrabold">
                        {r?.firstPrize ?? <span className="font-sans text-xs font-semibold text-muted">{r?.imageKey ? t.result.imageOutShort : t.result.awaited}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link href={L(`/result/${isoToDMY(date)}`)} className="mt-3 block text-center text-xs font-bold text-brand-2 hover:underline">
              {t.result.viewDay}
            </Link>
          </div>
          <Link href={L("/check-ticket")} className="card flex items-center gap-3 p-4 hover:border-brand-2">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold text-[#1c1400]">
              <Ticket className="size-5" />
            </span>
            <span>
              <span className="block font-extrabold">{t.result.checkerTitle}</span>
              <span className="block text-xs text-muted">{t.result.checkerDesc}</span>
            </span>
          </Link>
          <div className="card p-4">
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-muted">{t.result.findByDate}</h2>
            <DateJump max={today} defaultValue={date} t={dateJumpText(lang)} />
          </div>
          <Ad slot="sidebar" />
        </aside>
      </div>

      {isToday && <LiveWatcher date={date} have={{ [slot]: fingerprint(result) }} />}

      {result && hasData && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: `${title}${result.firstPrize ? ` – ${t.tiers.first} ${result.firstPrize}` : ""}`,
            description: summary,
            inLanguage: HREFLANG[lang],
            datePublished: isoWithIST(result.publishedAt ?? result.createdAt),
            dateModified: isoWithIST(result.updatedAt),
            mainEntityOfPage: url,
            image: result.imageKey ? [siteUrl() + mediaUrl(result.imageKey)] : [siteUrl() + "/icon-512.png"],
            author: { "@type": "Organization", name: s.siteName, url: siteUrl() },
            publisher: { "@type": "Organization", name: s.siteName, logo: { "@type": "ImageObject", url: siteUrl() + "/icon-512.png" } },
          }}
        />
      )}
    </>
  );
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-white/90 backdrop-blur">
      <span className="text-gold">{icon}</span>
      {children}
    </span>
  );
}
