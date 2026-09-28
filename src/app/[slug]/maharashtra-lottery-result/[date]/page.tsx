import { OtherDatePage, otherDateMetadata, type OtherDateParams } from "@/views/others";
import { localeFrom } from "@/lib/i18n/route";

export const revalidate = 2592000; // past dates don't change – rebuilt on demand if a result is added/edited
export const generateStaticParams = () => [];

type P = { params: Promise<{ date: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  return otherDateMetadata(await localeFrom(params), "maharashtra", params as OtherDateParams);
}

export default async function Page({ params }: P) {
  return <OtherDatePage lang={await localeFrom(params)} id="maharashtra" params={params as OtherDateParams} />;
}
