import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { CalendarDays, Clock3, Landmark, ChevronLeft, ChevronRight, ArrowRight, Trophy } from "lucide-react";
import { OTHER, OTHER_IDS, clockLabel, type OtherId } from "@/lib/others/config";
import { getOtherDraws, getOtherLatestDate, getOtherNeighbours, getOtherRecent } from "@/lib/others/data";
import { drawsFingerprint } from "@/lib/others/fp";
import { KERALA_BUMPERS, KERALA_WEEKLY } from "@/lib/lotteries";
import { getResultsForDate } from "@/lib/results";
import { getSettings } from "@/lib/settings";
import { SLOTS } from "@/lib/draws";
import { fingerprint } from "@/lib/live";
import { dmyToISO, dotted, isoToDMY, todayIST } from "@/lib/time";
import { fmt, getDict, longDateL, lp, shortDateL, weekdayL, type Locale } from "@/lib/i18n";
import { alternates, ogLocale, urlFor } from "@/lib/i18n/seo";
import { otherText } from "@/lib/i18n/others";
import { lotteryText, stateName } from "@/lib/i18n/lotteryText";
import { dateJumpText } from "@/lib/i18n/ui";
import type { LotteryDraw } from "@/lib/db/schema";
import { PageHero } from "@/components/PageHero";
import { FAQ } from "@/components/FAQ";
import { Ad } from "@/components/Ad";
import { Rich } from "@/components/Rich";
import { DateJump } from "@/components/DateJump";
import { DrawCard } from "@/components/DrawCard";
import { LiveWatcher } from "@/components/LiveWatcher";
import { OtherDrawView } from "@/components/others/OtherDrawView";
import { OtherFinder } from "@/components/others/OtherFinder";
import { OtherStatus } from "@/components/others/OtherStatus";
import { OtherLiveWatcher } from "@/components/others/OtherLiveWatcher";

const PUNJAB_WEEKLY = [
  { day: 1, name: "Dear 50 Beast" },
  { day: 2, name: "Dear 50 Bronco" },
  { day: 3, name: "Dear 50 Buster" },
  { day: 4, name: "Dear 50 Chief" },
  { day: 5, name: "Dear 50 Colt" },
  { day: 6, name: "Dear 50 Jackal" },
  { day: 0, name: "Dear 50 Ranger" },
];

const firstOf = (draws: LotteryDraw[]) => draws.map((d) => d.firstPrize).filter(Boolean) as string[];

/* ---------------- metadata ---------------- */

export async function otherMetadata(lang: Locale, id: OtherId): Promise<Metadata> {
  const o = otherText(lang);
  const today = todayIST();
  const [s, draws] = await Promise.all([getSettings(), getOtherDraws(id, today)]);
  const name = o.lotteries[id].name;
  const firsts = firstOf(draws);
  const title = fmt(o.ui.metaToday, { name, date: dotted(today) });
  const description = fmt(o.ui.metaTodayDesc, { name, date: longDateL(getDict(lang), today), first: firsts.length ? fmt(o.ui.metaFirst, { first: firsts.slice(0, 3).join(", ") }) : "" });
  const path = OTHER[id].path;
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: alternates(lang, path),
    openGraph: { title, description, url: urlFor(lang, path), type: "article", locale: ogLocale(lang) },
  };
}

export type OtherDateParams = Promise<{ date: string }>;

async function resolveDate(lang: Locale, id: OtherId, params: OtherDateParams) {
  const { date } = await params;
  let iso = dmyToISO(date);
  if (!iso) {
    const alt = dmyToISO(date.replace(/\./g, "-")) ?? (/^\d{4}-\d{2}-\d{2}$/.test(date) ? dmyToISO(date.split("-").reverse().join("-")) : null);
    if (alt) permanentRedirect(lp(lang, `${OTHER[id].path}/${isoToDMY(alt)}`));
    notFound();
  }
  if (iso > todayIST() || iso < "2015-01-01") notFound();
  return iso;
}

export async function otherDateMetadata(lang: Locale, id: OtherId, params: OtherDateParams): Promise<Metadata> {
  const iso = await resolveDate(lang, id, params);
  const o = otherText(lang);
  const [s, draws, dear] = await Promise.all([getSettings(), getOtherDraws(id, iso), id === "westbengal" ? getResultsForDate(iso) : Promise.resolve({})]);
  const name = o.lotteries[id].name;
  const firsts = [...firstOf(draws), ...SLOTS.map((x) => (dear as Record<string, { firstPrize: string | null }>)[x]?.firstPrize).filter(Boolean)] as string[];
  const title = fmt(o.ui.metaDate, { name, date: dotted(iso) });
  const description = fmt(o.ui.metaDateDesc, { name, date: longDateL(getDict(lang), iso), first: firsts.length ? fmt(o.ui.metaFirst, { first: firsts.slice(0, 3).join(", ") }) : "" });
  const path = `${OTHER[id].path}/${isoToDMY(iso)}`;
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: alternates(lang, path),
    robots: draws.length || (id === "westbengal" && firsts.length) ? undefined : { index: false, follow: true },
    openGraph: { title, description, url: urlFor(lang, path), type: "article", locale: ogLocale(lang) },
  };
}

/* ---------------- shared pieces ---------------- */

function OthersNav({ lang, current }: { lang: Locale; current: OtherId }) {
  const t = getDict(lang);
  const o = otherText(lang);
  return (
    <div className="card p-4">
      <h2 className="text-sm font-extrabold uppercase tracking-[0.12em] text-muted">{t.nav.lotteries}</h2>
      <ul className="mt-3 space-y-1.5 text-sm">
        <li>
          <Link href={lp(lang, "/")} className="flex items-center justify-between rounded-lg px-2 py-1.5 font-semibold hover:bg-surface-2">
            {t.home.h1a} <ArrowRight className="size-3.5 text-muted" />
          </Link>
        </li>
        {OTHER_IDS.filter((x) => x !== current).map((x) => (
          <li key={x}>
            <Link href={lp(lang, OTHER[x].path)} className="flex items-center justify-between rounded-lg px-2 py-1.5 font-semibold hover:bg-surface-2">
              {o.lotteries[x].name} <ArrowRight className="size-3.5 text-muted" />
            </Link>
          </li>
        ))}
        <li>
          <Link href={lp(lang, "/indian-lotteries")} className="flex items-center justify-between rounded-lg px-2 py-1.5 font-semibold text-brand-2 hover:bg-surface-2">
            {t.india.crumb} <ArrowRight className="size-3.5" />
          </Link>
        </li>
      </ul>
    </div>
  );
}

function Sidebar({ lang, id, date }: { lang: Locale; id: OtherId; date?: string }) {
  const t = getDict(lang);
  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <div className="card p-4">
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.12em] text-muted">{t.result.findByDate}</h2>
        <DateJump max={todayIST()} defaultValue={date} t={{ ...dateJumpText(lang), prefix: lp(lang, OTHER[id].path) }} />
      </div>
      <OthersNav lang={lang} current={id} />
      <Ad slot="sidebar" />
    </aside>
  );
}

async function RecentTable({ lang, id, before, title }: { lang: Locale; id: OtherId; before?: string; title: string }) {
  const t = getDict(lang);
  const rows = await getOtherRecent(id, 20, before);
  if (!rows.length) return null;
  return (
    <section className="mt-12">
      <h2 className="section-title">{title}</h2>
      <div className="card mt-5 overflow-x-auto">
        <table className="table-x min-w-[520px]">
          <thead>
            <tr>
              <th>{t.common.date}</th>
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
                <td className="text-muted">
                  {r.drawName}
                  {r.drawTime && <span className="ml-1 text-xs">· {r.drawTime}</span>}
                </td>
                <td>
                  {r.firstPrize ? (
                    <span className="num rounded-lg bg-gold-soft px-2 py-1 font-extrabold">{r.firstPrize}</span>
                  ) : (
                    <span className="text-xs text-muted">{r.imageKey ? t.common.image : "—"}</span>
                  )}
                </td>
                <td className="text-right">
                  <Link href={lp(lang, `${OTHER[id].path}/${isoToDMY(r.drawDate)}`)} className="font-bold text-brand-2 hover:underline">
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

function About({ lang, id }: { lang: Locale; id: OtherId }) {
  const t = getDict(lang);
  const o = otherText(lang);
  const c = o.lotteries[id];
  const lt = lotteryText(lang);
  const weekly = id === "kerala" ? KERALA_WEEKLY.map((k) => ({ day: k.day, name: lt.kerala?.[k.name] ?? k.name })) : id === "punjab" ? PUNJAB_WEEKLY : null;
  return (
    <section className="mt-12 space-y-6">
      <div className="prose-x max-w-none">
        <h2>{fmt(o.ui.aboutTitle, { name: c.name })}</h2>
        {c.intro.map((p, i) => (
          <p key={i}>
            <Rich text={p} lang={lang} />
          </p>
        ))}
      </div>
      {(weekly || id === "kerala") && (
        <div className="grid gap-5 lg:grid-cols-2">
          {weekly && (
            <div className="card overflow-x-auto">
              <h3 className="border-b border-line bg-surface-2 px-4 py-3 font-extrabold">
                {o.ui.scheduleTitle} · {clockLabel(OTHER[id].drawMinute)}
              </h3>
              <table className="table-x">
                <thead>
                  <tr>
                    <th>{o.ui.dayCol}</th>
                    <th>{o.ui.lotteryCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {weekly.map((w) => (
                    <tr key={w.day}>
                      <td className="font-semibold">{t.weekdays[w.day]}</td>
                      <td>{w.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {id === "kerala" && (
            <div className="card overflow-x-auto">
              <h3 className="border-b border-line bg-surface-2 px-4 py-3 font-extrabold">{o.ui.bumpersTitle}</h3>
              <table className="table-x">
                <thead>
                  <tr>
                    <th>{t.india.month}</th>
                    <th>{o.ui.lotteryCol}</th>
                    <th className="text-right">{t.common.firstPrize}</th>
                  </tr>
                </thead>
                <tbody>
                  {KERALA_BUMPERS.map((b) => (
                    <tr key={b.key}>
                      <td className="font-semibold">{t.months[b.month - 1]}</td>
                      <td>{lt.prizes[b.key]}</td>
                      <td className="whitespace-nowrap text-right font-bold tabular-nums">{fmt(t.india.crore, { n: b.crore })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <p className="text-xs text-muted">{o.ui.verify}</p>
    </section>
  );
}

function heroChips(lang: Locale, id: OtherId, date: string) {
  const t = getDict(lang);
  return (
    <div className="mt-6 flex flex-wrap gap-2 text-[0.78rem] font-semibold">
      <Chip icon={<CalendarDays className="size-3.5" />}>{shortDateL(t, date)}</Chip>
      {id !== "westbengal" && <Chip icon={<Clock3 className="size-3.5" />}>{clockLabel(OTHER[id].drawMinute)} IST</Chip>}
      <Chip icon={<Landmark className="size-3.5" />}>{fmt(t.common.stateLottery, { state: stateName(lang, OTHER[id].state) })}</Chip>
    </div>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-white/90 backdrop-blur">
      <span className="text-gold">{icon}</span>
      {children}
    </span>
  );
}

function DrawList({ draws, lang }: { draws: LotteryDraw[]; lang: Locale }) {
  return (
    <div id="other-draws" className="space-y-10">
      {draws.map((d, i) => (
        <div key={d.id}>
          <OtherDrawView draw={d} lang={lang} />
          {i === 0 && draws.length > 1 && <Ad slot="inContent" className="pt-8" />}
        </div>
      ))}
    </div>
  );
}

/** West Bengal: the Dear draws sold in the state (1 / 6 / 8 PM) for a date. */
async function WbDear({ lang, date }: { lang: Locale; date: string }) {
  const o = otherText(lang);
  const [s, draws] = await Promise.all([getSettings(), getResultsForDate(date)]);
  const isToday = date === todayIST();
  return (
    <section>
      <h2 className="section-title">{o.ui.wbDearTitle}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {SLOTS.map((x) => (
          <DrawCard key={x} slot={x} date={date} result={draws[x]} isToday={isToday} schedule={s.schedule} firstAmount={s.prizes.first} lang={lang} />
        ))}
      </div>
      {isToday && <LiveWatcher date={date} have={{ "1pm": fingerprint(draws["1pm"]), "6pm": fingerprint(draws["6pm"]), "8pm": fingerprint(draws["8pm"]) }} />}
    </section>
  );
}

/* ---------------- live page: /kerala-lottery-result ---------------- */

export async function OtherLivePage({ lang, id }: { lang: Locale; id: OtherId }) {
  const t = getDict(lang);
  const o = otherText(lang);
  const c = o.lotteries[id];
  const def = OTHER[id];
  const today = todayIST();
  const draws = await getOtherDraws(id, today);
  const latestDate = draws.length ? today : await getOtherLatestDate(id, today);
  const latest = draws.length ? draws : latestDate ? await getOtherDraws(id, latestDate) : [];
  const time = clockLabel(def.drawMinute);
  const complete = draws.length > 0 && draws.every((d) => d.isComplete);

  return (
    <>
      <PageHero
        lang={lang}
        crumbs={[{ name: c.name }]}
        eyebrow={
          complete || id === "westbengal" ? (
            <>{fmt(o.ui.eyebrow, { state: stateName(lang, def.state) })}</>
          ) : (
            <>
              <span className="live-dot" /> {fmt(o.ui.liveEyebrow, { time })}
            </>
          )
        }
        title={fmt(o.ui.todayTitle, { name: c.name, date: dotted(today) })}
        subtitle={fmt(o.ui.todaySub, { name: c.name, date: longDateL(t, today) })}
      >
        {heroChips(lang, id, today)}
      </PageHero>

      <div className="wrap mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          {id === "westbengal" && <WbDear lang={lang} date={today} />}

          {id !== "westbengal" && !draws.length && (
            <div className="card p-5 sm:p-8">
              <OtherStatus
                date={today}
                drawMinute={def.drawMinute}
                t={{ title: o.ui.waitTitle, startsIn: o.ui.startsIn, expected: fmt(o.ui.expected, { time }), live: o.ui.live, auto: o.ui.auto }}
              />
            </div>
          )}

          {latest.length > 0 && (
            <>
              {id === "westbengal" ? (
                <h2 className="section-title">{o.ui.wbOfficialTitle}</h2>
              ) : (
                latestDate !== today && (
                  <div className="flex items-center gap-2 text-sm font-extrabold text-muted">
                    <Trophy className="size-4 text-gold-2" /> {fmt(o.ui.latestTitle, { date: longDateL(t, latestDate!) })}
                  </div>
                )
              )}
              <OtherFinder containerId="other-draws" t={{ title: o.ui.finderTitle, placeholder: o.ui.finderPh, match: t.finder.match, none: t.finder.none, verify: t.finder.verify }} />
              <Ad slot="resultTop" />
              <DrawList draws={latest} lang={lang} />
            </>
          )}

          <Ad slot="resultBottom" />
          <RecentTable lang={lang} id={id} before={latestDate ?? undefined} title={fmt(o.ui.previousTitle, { name: c.name })} />
          <About lang={lang} id={id} />
          <FAQ items={c.faq.map((x) => ({ q: x.q, a: x.a.replace(/\[(.+?)\]\([^)]+\)/g, "$1") }))} title={t.common.faq} />
        </div>
        <Sidebar lang={lang} id={id} />
      </div>

      {def.window && <OtherLiveWatcher lottery={id} date={today} fp={drawsFingerprint(draws)} from={def.window.from} to={def.window.to} complete={complete && !def.multi} />}
    </>
  );
}

/* ---------------- date page: /kerala-lottery-result/25-09-2026 ---------------- */

export async function OtherDatePage({ lang, id, params }: { lang: Locale; id: OtherId; params: OtherDateParams }) {
  const iso = await resolveDate(lang, id, params);
  const t = getDict(lang);
  const o = otherText(lang);
  const c = o.lotteries[id];
  const def = OTHER[id];
  const [draws, nb] = await Promise.all([getOtherDraws(id, iso), getOtherNeighbours(id, iso)]);
  const L = (d: string) => lp(lang, `${def.path}/${isoToDMY(d)}`);

  return (
    <>
      <PageHero
        lang={lang}
        crumbs={[{ name: c.name, href: lp(lang, def.path) }, { name: dotted(iso) }]}
        eyebrow={fmt(o.ui.eyebrow, { state: stateName(lang, def.state) })}
        title={fmt(o.ui.dateTitle, { name: c.name, date: dotted(iso) })}
        subtitle={fmt(o.ui.dateSub, { name: c.name, date: `${weekdayL(t, iso)}, ${longDateL(t, iso)}` })}
      >
        {heroChips(lang, id, iso)}
      </PageHero>

      <div className="wrap mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          {id === "westbengal" && <WbDear lang={lang} date={iso} />}
          {draws.length > 0 ? (
            <>
              {id === "westbengal" && <h2 className="section-title">{o.ui.wbOfficialTitle}</h2>}
              <OtherFinder containerId="other-draws" t={{ title: o.ui.finderTitle, placeholder: o.ui.finderPh, match: t.finder.match, none: t.finder.none, verify: t.finder.verify }} />
              <Ad slot="resultTop" />
              <DrawList draws={draws} lang={lang} />
            </>
          ) : (
            id !== "westbengal" && <div className="card p-6 text-center text-sm text-muted">{o.ui.notAvail}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {nb.prev ? (
              <Link href={L(nb.prev)} className="card flex items-center gap-2 p-4 text-sm font-bold hover:border-brand-2">
                <ChevronLeft className="size-4 shrink-0" />
                <span>
                  <span className="block text-xs font-semibold text-muted">{t.common.previous}</span>
                  {shortDateL(t, nb.prev)}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {nb.next ? (
              <Link href={nb.next === todayIST() ? lp(lang, def.path) : L(nb.next)} className="card flex items-center justify-end gap-2 p-4 text-right text-sm font-bold hover:border-brand-2">
                <span>
                  <span className="block text-xs font-semibold text-muted">{t.common.next}</span>
                  {shortDateL(t, nb.next)}
                </span>
                <ChevronRight className="size-4 shrink-0" />
              </Link>
            ) : (
              <span />
            )}
          </div>

          <Ad slot="resultBottom" />
          <RecentTable lang={lang} id={id} before={iso} title={fmt(o.ui.previousTitle, { name: c.name })} />
          <About lang={lang} id={id} />
        </div>
        <Sidebar lang={lang} id={id} date={iso} />
      </div>
    </>
  );
}
