import { DatePage, dateMetadata, type DateParams } from "@/views/day";
import { localeFrom } from "@/lib/i18n/route";

export const revalidate = 2592000; // past dates don't change – rebuilt on demand if a result is added/edited
export const generateStaticParams = () => [];

type P = { params: Promise<{ date: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  return dateMetadata(await localeFrom(params), params as DateParams);
}

export default async function Page({ params }: P) {
  const lang = await localeFrom(params);
  return <DatePage lang={lang} params={params as DateParams} />;
}
