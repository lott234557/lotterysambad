import type { Metadata } from "next";
import { DayPage } from "@/components/DayPage";
import { getSettings, siteUrl } from "@/lib/settings";
import { addDays, dotted, longDate, todayIST } from "@/lib/time";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const d = addDays(todayIST(), -1);
  const title = `Lottery Sambad Yesterday Result ${dotted(d)} – 1 PM, 6 PM, 8 PM`;
  const description = `Lottery Sambad yesterday result of ${longDate(d)}: all winning numbers of the 1 PM, 6 PM and 8 PM Dear Lottery draws with result images.`;
  return { title: { absolute: `${title} | ${s.siteName}` }, description, alternates: { canonical: siteUrl() + "/lottery-sambad-yesterday-result" }, openGraph: { title, description } };
}

export default function Page() {
  const d = addDays(todayIST(), -1);
  return <DayPage date={d} title={`Lottery Sambad Yesterday Result – ${dotted(d)}`} eyebrow="Yesterday" crumbs={[{ name: "Yesterday Result" }]} />;
}
