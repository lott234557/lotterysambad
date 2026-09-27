import { OtherDatePage, otherDateMetadata, type OtherDateParams } from "@/views/others";
import { localeFrom } from "@/lib/i18n/route";

export const revalidate = 86400;
export const generateStaticParams = () => [];

type P = { params: Promise<{ date: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  return otherDateMetadata(await localeFrom(params), "kerala", params as OtherDateParams);
}

export default async function Page({ params }: P) {
  return <OtherDatePage lang={await localeFrom(params)} id="kerala" params={params as OtherDateParams} />;
}
