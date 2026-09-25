import type { Metadata } from "next";
import { ArchiveView } from "@/components/ArchiveView";
import { getSettings, siteUrl } from "@/lib/settings";
import { monthKey, todayIST } from "@/lib/time";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = "Lottery Sambad Old Result – Date-wise Archive (1 PM, 6 PM, 8 PM)";
  const description = "Lottery Sambad old results archive: check any past Dear Lottery 1 PM, 6 PM and 8 PM result by date or month with full prize list and result images.";
  return { title: { absolute: `${title} | ${s.siteName}` }, description, alternates: { canonical: siteUrl() + "/old-results" }, openGraph: { title, description } };
}

export default function Page() {
  return <ArchiveView month={monthKey(todayIST())} isIndex />;
}
