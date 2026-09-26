import { IndiaView, indiaMetadata } from "@/views/india";
import { localeFrom, type LocaleParams } from "@/lib/i18n/route";

export const revalidate = 86400;
export const generateStaticParams = () => [];

type P = { params: LocaleParams };

export async function generateMetadata({ params }: P) {
  return indiaMetadata(await localeFrom(params));
}

export default async function Page({ params }: P) {
  const lang = await localeFrom(params);
  return <IndiaView lang={lang} />;
}
