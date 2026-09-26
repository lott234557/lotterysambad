import { TodayPage, todayMetadata } from "@/views/day";
import { localeFrom, type LocaleParams } from "@/lib/i18n/route";

export const revalidate = 1800;
export const generateStaticParams = () => [];

type P = { params: LocaleParams };

export async function generateMetadata({ params }: P) {
  return todayMetadata(await localeFrom(params));
}

export default async function Page({ params }: P) {
  const lang = await localeFrom(params);
  return <TodayPage lang={lang} />;
}
