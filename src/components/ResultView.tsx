import Link from "next/link";
import { CalendarDays, Clock3, Landmark, Hash, RefreshCw, ChevronLeft, ChevronRight, Ticket, TrendingUp } from "lucide-react";
import { SLOTS, SLOT_META, drawNameFor, type Slot } from "@/lib/draws";
import type { Result } from "@/lib/db/schema";
import type { SiteSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/settings";
import { dotted, formatIST, fullDate, isoToDMY, isoWithIST, longDate, shortDate, todayIST } from "@/lib/time";
import { getNeighbours, getRecentBySlot, getResultsForDate, getSeriesStats } from "@/lib/results";
import { resultSummary, slotFaqs, SLOT_INTRO } from "@/lib/content";
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

export async function ResultView({
  date,
  slot,
  result,
  settings: s,
  live = false,
}: {
  date: string;
  slot: Slot;
  result: Result | null;
  settings: SiteSettings;
  live?: boolean;
}) {
  const m = SLOT_META[slot];
  const today = todayIST();
  const isToday = date === today;
  const name = result?.drawName || drawNameFor(slot, date, s.schedule);
  const canonicalPath = live ? m.path : `/result/${isoToDMY(date)}/${slot}`;
  const url = siteUrl() + canonicalPath;
  const title = live
    ? `Lottery Sambad ${m.label} Result Today – ${dotted(date)}`
    : `Lottery Sambad ${m.label} Result ${dotted(date)}`;

  const [recent, sameDay, nb, series] = await Promise.all([
    getRecentBySlot(slot, 10, date),
    getResultsForDate(date),
    getNeighbours(date),
    result?.firstPrize ? getSeriesStats(result.firstPrize.split(" ")[0], date) : Promise.resolve([]),
  ]);

  const hasData = !!(result && (result.firstPrize || result.imageKey));
  const imgAlt = `Lottery Sambad ${m.label} result ${longDate(date)} ${name}`;

  return (
    <>
      <PageHero
        crumbs={
          live
            ? [{ name: `${m.label} Result` }]
            : [
                { name: "Old Results", href: "/old-results" },
                { name: dotted(date), href: `/result/${isoToDMY(date)}` },
                { name: m.label },
              ]
        }
        eyebrow={
          isToday && !result?.isComplete ? (
            <>
              <span className="live-dot" /> Live · {m.time} Draw
            </>
          ) : (
            <>Dear Lottery · {m.time} Draw</>
          )
        }
        title={title}
        subtitle={
          <>
            {name} · {m.period} draw of {fullDate(date)}. Complete 1st to 5th prize list with the result image
            {isToday ? ", updated automatically the moment it is declared." : "."}
          </>
        }
      >
        <div className="mt-6 flex flex-wrap gap-2 text-[0.78rem] font-semibold">
          <Meta icon={<CalendarDays className="size-3.5" />}>{shortDate(date)}</Meta>
          <Meta icon={<Clock3 className="size-3.5" />}>{m.time} IST</Meta>
          <Meta icon={<Landmark className="size-3.5" />}>{result?.state ?? m.state} State Lottery</Meta>
          {result?.drawNo && <Meta icon={<Hash className="size-3.5" />}>Draw No. {result.drawNo}</Meta>}
          {result?.updatedAt && hasData && formatIST(result.updatedAt).startsWith(shortDate(date)) && (
            <Meta icon={<RefreshCw className="size-3.5" />}>Updated {formatIST(result.updatedAt)}</Meta>
          )}
        </div>
      </PageHero>

      <div className="wrap mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {!hasData && (
            <div className="card p-5 sm:p-8">
              {isToday ? (
                <DrawStatus date={date} slot={slot} />
              ) : (
                <p className="text-center text-muted">The result for this draw is not available yet. Please check again later.</p>
              )}
            </div>
          )}

          {!hasData && recent[0]?.firstPrize && (
            <Link href={`/result/${isoToDMY(recent[0].drawDate)}/${slot}`} className="card group flex flex-col items-center gap-4 p-5 hover:border-brand-2 sm:flex-row sm:justify-between">
              <div>
                <div className="eyebrow">Last declared {m.label} result</div>
                <div className="mt-1 font-extrabold">
                  {fullDate(recent[0].drawDate)} · {recent[0].drawName}
                </div>
                <div className="mt-1 text-sm font-bold text-brand-2 group-hover:underline">See full prize list →</div>
              </div>
              <div className="w-full max-w-[280px]">
                <FirstPrize number={recent[0].firstPrize} amount={s.prizes.first} />
              </div>
            </Link>
          )}

          {result && hasData && (
            <>
              <p className="text-[0.98rem] leading-relaxed text-muted">{resultSummary(result, s.prizes.first)}</p>
              <Ad slot="resultTop" />
              {result.firstPrize && <NumberFinder data={result} prizes={s.prizes} />}
              {result.firstPrize ? (
                <PrizeTiers result={result} prizes={s.prizes} middle={<Ad slot="resultMiddle" className="pt-4" />} />
              ) : (
                <div className="card flex items-center gap-3 p-5 text-sm font-semibold">
                  <span className="live-dot" /> The result image is out – text numbers are being updated.
                </div>
              )}
              <ResultImage
                result={result}
                alt={imgAlt}
                credit={s.showImageCredit && result.imageSourceUrl ? new URL(result.imageSourceUrl).hostname : null}
                priority={!result.firstPrize}
              />
              <Ad slot="resultBottom" />
              <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-bold">Share this result</span>
                <ShareBar url={url} title={`${title} – 1st Prize ${result.firstPrize ?? ""}`} />
              </div>
            </>
          )}

          {/* prev / next */}
          <div className="grid grid-cols-2 gap-3">
            {nb.prev ? (
              <Link href={`/result/${isoToDMY(nb.prev)}/${slot}`} className="card flex items-center gap-2 p-4 text-sm font-bold hover:border-brand-2">
                <ChevronLeft className="size-4 shrink-0" />
                <span>
                  <span className="block text-xs font-semibold text-muted">Previous</span>
                  {m.label} · {shortDate(nb.prev)}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {nb.next ? (
              <Link href={`/result/${isoToDMY(nb.next)}/${slot}`} className="card flex items-center justify-end gap-2 p-4 text-right text-sm font-bold hover:border-brand-2">
                <span>
                  <span className="block text-xs font-semibold text-muted">Next</span>
                  {m.label} · {shortDate(nb.next)}
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
                <TrendingUp className="size-5 text-gold-2" /> Series {result.firstPrize.split(" ")[0]} – 1st prize history
              </h2>
              <p className="mt-2 text-sm text-muted">
                {series.length
                  ? `Series ${result.firstPrize.split(" ")[0]} has won the first prize ${series.length} time${series.length > 1 ? "s" : ""} in the previous 365 days (as per our archive).`
                  : `Series ${result.firstPrize.split(" ")[0]} has not won the first prize in the previous 365 days of our archive.`}
              </p>
              {series.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {series.slice(0, 8).map((x) => (
                    <Link key={x.drawDate + x.slot} href={`/result/${isoToDMY(x.drawDate)}/${x.slot}`} className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold hover:border-brand-2">
                      <span className="num">{x.firstPrize}</span> · {shortDate(x.drawDate)} {SLOT_META[x.slot as Slot].label}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {result?.notes && <div className="prose-x card p-5 sm:p-7" dangerouslySetInnerHTML={{ __html: renderMarkdown(result.notes) }} />}

          <RecentResults rows={recent} title={`Previous ${m.label} results`} />

          <section className="prose-x mt-12">
            <h2>About Lottery Sambad {m.label} ({m.period}) draw</h2>
            <p>{SLOT_INTRO[slot]}</p>
            <h3>Prize structure</h3>
            <p>
              1st prize <strong>{s.prizes.first}</strong>, consolation prize {s.prizes.cons}, 2nd prize {s.prizes.second}, 3rd prize{" "}
              {s.prizes.third}, 4th prize {s.prizes.fourth} and 5th prize {s.prizes.fifth}. See the{" "}
              <Link href="/lottery-sambad-draw-schedule">full draw schedule & prize list</Link>.
            </p>
            <h3>How to check the result</h3>
            <ol>
              <li>Match the full ticket number (series + 5 digits) with the 1st prize.</li>
              <li>Match the last 5 digits with the consolation and 2nd prize numbers.</li>
              <li>Match the last 4 digits with the 3rd, 4th and 5th prize numbers.</li>
              <li>Always confirm with the official Government Gazette before claiming.</li>
            </ol>
          </section>

          <FAQ items={slotFaqs(slot, s.prizes)} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-4">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-muted">{shortDate(date)} – all draws</h2>
            <ul className="mt-3 space-y-2">
              {SLOTS.map((x) => {
                const r = sameDay[x];
                const on = x === slot;
                return (
                  <li key={x}>
                    <Link
                      href={isToday ? SLOT_META[x].path : `/result/${isoToDMY(date)}/${x}`}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${on ? "border-gold bg-gold-soft" : "border-line hover:border-brand-2"}`}
                    >
                      <span className="font-bold">{SLOT_META[x].time}</span>
                      <span className="num font-extrabold">{r?.firstPrize ?? <span className="font-sans text-xs font-semibold text-muted">{r?.imageKey ? "Image out" : "Awaited"}</span>}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link href={`/result/${isoToDMY(date)}`} className="mt-3 block text-center text-xs font-bold text-brand-2 hover:underline">
              View full day result →
            </Link>
          </div>
          <Link href="/check-ticket" className="card flex items-center gap-3 p-4 hover:border-brand-2">
            <span className="grid size-11 place-items-center rounded-xl bg-gold text-[#1c1400]">
              <Ticket className="size-5" />
            </span>
            <span>
              <span className="block font-extrabold">Ticket Checker</span>
              <span className="block text-xs text-muted">Check any ticket against any date</span>
            </span>
          </Link>
          <div className="card p-4">
            <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-muted">Find result by date</h2>
            <DateJump max={today} defaultValue={date} />
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
          headline: `${title}${result?.firstPrize ? ` – 1st Prize ${result.firstPrize}` : ""}`,
          description: resultSummary(result, s.prizes.first),
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
