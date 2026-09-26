import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSettings } from "@/lib/settings";
import { monthKey, todayIST } from "@/lib/time";
import { fmt, getDict, monthLabelL, type Locale } from "@/lib/i18n";
import { alternates, ogLocale, urlFor } from "@/lib/i18n/seo";
import { ArchiveView } from "@/components/ArchiveView";

export async function archiveIndexMetadata(lang: Locale): Promise<Metadata> {
  const t = getDict(lang);
  const s = await getSettings();
  const title = t.archive.metaIndex;
  const description = t.archive.metaIndexDesc;
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: alternates(lang, "/old-results"),
    openGraph: { title, description, url: urlFor(lang, "/old-results"), locale: ogLocale(lang) },
  };
}

export function ArchiveIndex({ lang }: { lang: Locale }) {
  return <ArchiveView month={monthKey(todayIST())} isIndex lang={lang} />;
}

export type MonthParams = Promise<{ month: string }>;

export async function resolveMonth(params: MonthParams) {
  const { month } = await params;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month > monthKey(todayIST()) || month < "2015-01") notFound();
  return month;
}

export async function archiveMonthMetadata(lang: Locale, params: MonthParams): Promise<Metadata> {
  const t = getDict(lang);
  const month = await resolveMonth(params);
  const s = await getSettings();
  const label = monthLabelL(t, month);
  const title = fmt(t.archive.metaMonth, { month: label });
  const description = fmt(t.archive.metaMonthDesc, { month: label });
  const path = `/old-results/${month}`;
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: alternates(lang, path),
    openGraph: { title, description, url: urlFor(lang, path), locale: ogLocale(lang) },
  };
}

export async function ArchiveMonth({ lang, params }: { lang: Locale; params: MonthParams }) {
  const month = await resolveMonth(params);
  return <ArchiveView month={month} isIndex={false} lang={lang} />;
}
