import { YesterdayPage, yesterdayMetadata } from "@/views/day";
import { localeFrom, type LocaleParams } from "@/lib/i18n/route";

export const revalidate = 3600;
export const generateStaticParams = () => [];

type P = { params: LocaleParams };

export async function generateMetadata({ params }: P) {
  return yesterdayMetadata(await localeFrom(params));
}

export default async function Page({ params }: P) {
  const lang = await localeFrom(params);
  return <YesterdayPage lang={lang} />;
}
