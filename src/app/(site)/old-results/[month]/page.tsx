import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchiveView } from "@/components/ArchiveView";
import { getSettings, siteUrl } from "@/lib/settings";
import { monthKey, monthLabel, todayIST } from "@/lib/time";

export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

type P = { params: Promise<{ month: string }> };

async function resolve(params: P["params"]) {
  const { month } = await params;
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month > monthKey(todayIST()) || month < "2015-01") notFound();
  return month;
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const month = await resolve(params);
  const s = await getSettings();
  const label = monthLabel(month);
  const title = `Lottery Sambad Old Result ${label} – All Dates`;
  const description = `Lottery Sambad results of ${label}: date-wise 1 PM, 6 PM and 8 PM Dear Lottery first prizes with links to the full prize list and result images.`;
  return { title: { absolute: `${title} | ${s.siteName}` }, description, alternates: { canonical: `${siteUrl()}/old-results/${month}` }, openGraph: { title, description } };
}

export default async function Page({ params }: P) {
  const month = await resolve(params);
  return <ArchiveView month={month} isIndex={false} />;
}
