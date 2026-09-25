import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { SLOT_META, drawNameFor, isSlot } from "@/lib/draws";
import { getResult } from "@/lib/results";
import { getSettings, siteUrl } from "@/lib/settings";
import { dmyToISO, dotted, isoToDMY, longDate, todayIST } from "@/lib/time";
import { ResultView } from "@/components/ResultView";

export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

type P = { params: Promise<{ date: string; slot: string }> };

async function resolve(params: P["params"]) {
  const { date, slot } = await params;
  const iso = dmyToISO(date);
  const sl = slot.toLowerCase().replace(/[^0-9pm]/g, "");
  if (!iso || !isSlot(sl) || iso > todayIST()) notFound();
  if (sl !== slot) permanentRedirect(`/result/${date}/${sl}`);
  return { iso, slot: sl };
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { iso, slot } = await resolve(params);
  const [s, r] = await Promise.all([getSettings(), getResult(iso, slot)]);
  const m = SLOT_META[slot];
  const name = r?.drawName || drawNameFor(slot, iso, s.schedule);
  const title = `Lottery Sambad ${m.label} Result ${dotted(iso)} – ${name}${r?.firstPrize ? ` (1st Prize ${r.firstPrize})` : ""}`;
  const description = r?.firstPrize
    ? `Lottery Sambad ${m.label} result of ${longDate(iso)} (${name}). 1st prize ${r.firstPrize}; see all 1st to 5th prize winning numbers and download the result image.`
    : `Lottery Sambad ${m.label} result of ${longDate(iso)} (${name}) – complete winning numbers list and result image.`;
  const url = `${siteUrl()}/result/${isoToDMY(iso)}/${slot}`;
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: { canonical: url },
    robots: r ? undefined : { index: false, follow: true },
    openGraph: { title, description, url, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({ params }: P) {
  const { iso, slot } = await resolve(params);
  const [s, r] = await Promise.all([getSettings(), getResult(iso, slot)]);
  if (!r && iso < todayIST()) {
    // Old date without data – still render (useful when a draw was skipped) but not indexed.
  }
  return <ResultView date={iso} slot={slot} result={r} settings={s} />;
}
