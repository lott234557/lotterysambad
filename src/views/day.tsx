import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SLOTS } from "@/lib/draws";
import { getResultsForDate } from "@/lib/results";
import { getSettings } from "@/lib/settings";
import { addDays, dmyToISO, dotted, isoToDMY, todayIST } from "@/lib/time";
import { fmt, getDict, longDateL, lp, weekdayL, type Locale } from "@/lib/i18n";
import { alternates, ogLocale, urlFor } from "@/lib/i18n/seo";
import { DayPage } from "@/components/DayPage";

async function meta(lang: Locale, path: string, title: string, description: string, extra: Partial<Metadata> = {}): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: alternates(lang, path),
    openGraph: { title, description, url: urlFor(lang, path), locale: ogLocale(lang) },
    ...extra,
  };
}

/* ---------- today ---------- */
export async function todayMetadata(lang: Locale) {
  const t = getDict(lang);
  const d = todayIST();
  return meta(lang, "/lottery-sambad-today", fmt(t.day.metaToday, { date: dotted(d) }), fmt(t.day.metaTodayDesc, { date: longDateL(t, d) }));
}
export function TodayPage({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const d = todayIST();
  return <DayPage lang={lang} date={d} title={fmt(t.day.todayTitle, { date: dotted(d) })} eyebrow={t.day.todayEyebrow} crumbs={[{ name: t.day.todayCrumb }]} />;
}

/* ---------- yesterday ---------- */
export async function yesterdayMetadata(lang: Locale) {
  const t = getDict(lang);
  const d = addDays(todayIST(), -1);
  return meta(lang, "/lottery-sambad-yesterday-result", fmt(t.day.metaY, { date: dotted(d) }), fmt(t.day.metaYDesc, { date: longDateL(t, d) }));
}
export function YesterdayPage({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const d = addDays(todayIST(), -1);
  return <DayPage lang={lang} date={d} title={fmt(t.day.yTitle, { date: dotted(d) })} eyebrow={t.day.yEyebrow} crumbs={[{ name: t.day.yCrumb }]} />;
}

/* ---------- any date: /result/25-09-2026 ---------- */
export type DateParams = Promise<{ date: string }>;

export async function resolveDate(lang: Locale, params: DateParams) {
  const { date } = await params;
  let iso = dmyToISO(date);
  if (!iso) {
    // accept 25.09.2026 / 2026-09-25 and redirect to the canonical form
    const alt = date.replace(/\./g, "-");
    iso = dmyToISO(alt) ?? (/^\d{4}-\d{2}-\d{2}$/.test(date) ? dmyToISO(date.split("-").reverse().join("-")) : null);
    if (iso) permanentRedirect(lp(lang, `/result/${isoToDMY(iso)}`));
    notFound();
  }
  if (iso > todayIST()) notFound();
  return iso;
}

export async function dateMetadata(lang: Locale, params: DateParams): Promise<Metadata> {
  const t = getDict(lang);
  const iso = await resolveDate(lang, params);
  const draws = await getResultsForDate(iso);
  const firsts = SLOTS.map((x) => draws[x]?.firstPrize).filter(Boolean) as string[];
  const title = fmt(t.day.metaDate, { date: dotted(iso) });
  const description = fmt(t.day.metaDateDesc, {
    date: `${longDateL(t, iso)} (${weekdayL(t, iso)})`,
    firsts: firsts.length ? fmt(t.day.metaFirsts, { list: firsts.join(", ") }) : "",
  });
  return meta(lang, `/result/${isoToDMY(iso)}`, title, description, {
    robots: Object.keys(draws).length ? undefined : { index: false, follow: true },
  });
}

export async function DatePage({ lang, params }: { lang: Locale; params: DateParams }) {
  const t = getDict(lang);
  const iso = await resolveDate(lang, params);
  return (
    <DayPage
      lang={lang}
      date={iso}
      title={fmt(t.day.dateTitle, { date: dotted(iso) })}
      eyebrow={weekdayL(t, iso)}
      crumbs={[{ name: t.archive.crumb, href: lp(lang, "/old-results") }, { name: dotted(iso) }]}
    />
  );
}

