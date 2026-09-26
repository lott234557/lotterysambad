import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SLOT_META, drawNameFor, isSlot, type Slot } from "@/lib/draws";
import { getResult } from "@/lib/results";
import { getSettings } from "@/lib/settings";
import { dmyToISO, dotted, todayIST, isoToDMY } from "@/lib/time";
import { fmt, getDict, longDateL, lp, type Locale } from "@/lib/i18n";
import { alternates, ogLocale, urlFor } from "@/lib/i18n/seo";
import { ResultView } from "@/components/ResultView";

/* ---------- live slot pages: /lottery-sambad-1pm-result ---------- */

export async function slotMetadata(lang: Locale, slot: Slot): Promise<Metadata> {
  const t = getDict(lang);
  const today = todayIST();
  const [s, r] = await Promise.all([getSettings(), getResult(today, slot)]);
  const m = SLOT_META[slot];
  const ts = t.slots[slot];
  const name = r?.drawName || drawNameFor(slot, today, s.schedule);
  const title = fmt(t.slotMeta.title, { slot: ts.label, date: dotted(today), nick: ts.nick });
  const vars = { slot: ts.label, date: longDateL(t, today), name, first: r?.firstPrize ?? "", expected: ts.expected };
  const description = fmt(r?.firstPrize ? t.slotMeta.desc : t.slotMeta.descWaiting, vars);
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: alternates(lang, m.path),
    openGraph: { title, description, url: urlFor(lang, m.path), type: "article", locale: ogLocale(lang) },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function SlotLivePage({ slot, lang }: { slot: Slot; lang: Locale }) {
  const today = todayIST();
  const [s, r] = await Promise.all([getSettings(), getResult(today, slot)]);
  return <ResultView date={today} slot={slot} result={r} settings={s} live lang={lang} />;
}

/* ---------- single draw pages: /result/25-09-2026/8pm ---------- */

export type DrawParams = Promise<{ date: string; slot: string }>;

export async function resolveDraw(lang: Locale, params: DrawParams) {
  const { date, slot } = await params;
  const iso = dmyToISO(date);
  const sl = slot.toLowerCase().replace(/[^0-9pm]/g, "");
  if (!iso || !isSlot(sl) || iso > todayIST()) notFound();
  if (sl !== slot) permanentRedirect(lp(lang, `/result/${date}/${sl}`));
  return { iso, slot: sl };
}

export async function drawMetadata(lang: Locale, params: DrawParams): Promise<Metadata> {
  const t = getDict(lang);
  const { iso, slot } = await resolveDraw(lang, params);
  const [s, r] = await Promise.all([getSettings(), getResult(iso, slot)]);
  const ts = t.slots[slot];
  const name = r?.drawName || drawNameFor(slot, iso, s.schedule);
  const title =
    fmt(t.slotMeta.drawTitle, { slot: ts.label, date: dotted(iso), name }) + (r?.firstPrize ? fmt(t.slotMeta.drawTitleFirst, { first: r.firstPrize }) : "");
  const vars = { slot: ts.label, date: longDateL(t, iso), name, first: r?.firstPrize ?? "" };
  const description = fmt(r?.firstPrize ? t.slotMeta.drawDesc : t.slotMeta.drawDescNo, vars);
  const path = `/result/${isoToDMY(iso)}/${slot}`;
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: alternates(lang, path),
    robots: r ? undefined : { index: false, follow: true },
    openGraph: { title, description, url: urlFor(lang, path), type: "article", locale: ogLocale(lang) },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function DrawPage({ lang, params }: { lang: Locale; params: DrawParams }) {
  const { iso, slot } = await resolveDraw(lang, params);
  const [s, r] = await Promise.all([getSettings(), getResult(iso, slot)]);
  return <ResultView date={iso} slot={slot} result={r} settings={s} lang={lang} />;
}
