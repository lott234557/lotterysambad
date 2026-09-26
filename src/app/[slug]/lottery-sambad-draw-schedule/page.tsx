import { ScheduleView, scheduleMetadata } from "@/views/pages";
import { localeFrom, type LocaleParams } from "@/lib/i18n/route";

export const revalidate = 86400;
export const generateStaticParams = () => [];

type P = { params: LocaleParams };

export async function generateMetadata({ params }: P) {
  return scheduleMetadata(await localeFrom(params));
}

export default async function Page({ params }: P) {
  const lang = await localeFrom(params);
  return <ScheduleView lang={lang} />;
}
