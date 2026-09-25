import type { Metadata } from "next";
import { DayPage } from "@/components/DayPage";
import { getSettings, siteUrl } from "@/lib/settings";
import { dotted, longDate, todayIST } from "@/lib/time";

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const d = todayIST();
  const title = `Lottery Sambad Today Result ${dotted(d)} – 1 PM, 6 PM, 8 PM Full List`;
  const description = `Lottery Sambad today result ${longDate(d)}: complete 1st to 5th prize list of the 1 PM, 6 PM and 8 PM Dear Lottery draws with result images, updated live.`;
  return { title: { absolute: `${title} | ${s.siteName}` }, description, alternates: { canonical: siteUrl() + "/lottery-sambad-today" }, openGraph: { title, description } };
}

export default function Page() {
  const d = todayIST();
  return <DayPage date={d} title={`Lottery Sambad Today Result – ${dotted(d)}`} eyebrow="Today · Live" crumbs={[{ name: "Lottery Sambad Today" }]} />;
}
