import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { DayPage } from "@/components/DayPage";
import { getResultsForDate } from "@/lib/results";
import { getSettings, siteUrl } from "@/lib/settings";
import { dmyToISO, dotted, fullDate, isoToDMY, longDate, todayIST } from "@/lib/time";
import { SLOTS } from "@/lib/draws";

export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

type P = { params: Promise<{ date: string }> };

async function resolve(params: P["params"]) {
  const { date } = await params;
  let iso = dmyToISO(date);
  if (!iso) {
    // accept 25.09.2026 / 2026-09-25 and redirect to the canonical form
    const alt = date.replace(/\./g, "-");
    iso = dmyToISO(alt) ?? (/^\d{4}-\d{2}-\d{2}$/.test(date) ? dmyToISO(date.split("-").reverse().join("-")) : null);
    if (iso) permanentRedirect(`/result/${isoToDMY(iso)}`);
    notFound();
  }
  if (iso > todayIST()) notFound();
  return iso;
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const iso = await resolve(params);
  const [s, draws] = await Promise.all([getSettings(), getResultsForDate(iso)]);
  const firsts = SLOTS.map((x) => draws[x]?.firstPrize).filter(Boolean);
  const title = `Lottery Sambad Result ${dotted(iso)} – 1 PM, 6 PM & 8 PM`;
  const description = `Lottery Sambad result of ${longDate(iso)} (${fullDate(iso).split(",")[0]}): ${firsts.length ? `1st prizes ${firsts.join(", ")}. ` : ""}Complete winning numbers of all three Dear Lottery draws with result images.`;
  return {
    title: { absolute: `${title} | ${s.siteName}` },
    description,
    alternates: { canonical: `${siteUrl()}/result/${isoToDMY(iso)}` },
    robots: Object.keys(draws).length ? undefined : { index: false, follow: true },
    openGraph: { title, description },
  };
}

export default async function Page({ params }: P) {
  const iso = await resolve(params);
  return (
    <DayPage
      date={iso}
      title={`Lottery Sambad Result ${dotted(iso)}`}
      eyebrow={fullDate(iso).split(",")[0]}
      crumbs={[{ name: "Old Results", href: "/old-results" }, { name: dotted(iso) }]}
    />
  );
}
