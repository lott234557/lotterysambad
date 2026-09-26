import { ArchiveMonth, archiveMonthMetadata, type MonthParams } from "@/views/archive";
import { localeFrom } from "@/lib/i18n/route";

export const revalidate = 86400;
export const generateStaticParams = () => [];

type P = { params: Promise<{ month: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  return archiveMonthMetadata(await localeFrom(params), params as MonthParams);
}

export default async function Page({ params }: P) {
  const lang = await localeFrom(params);
  return <ArchiveMonth lang={lang} params={params as MonthParams} />;
}
