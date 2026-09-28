import { OtherLivePage, otherMetadata } from "@/views/others";
import { localeFrom, type LocaleParams } from "@/lib/i18n/route";

export const revalidate = 86400; // safety net only – pages are rebuilt on demand when a result arrives and once after midnight (src/lib/revalidate.ts)
export const generateStaticParams = () => [];

type P = { params: LocaleParams };

export async function generateMetadata({ params }: P) {
  return otherMetadata(await localeFrom(params), "punjab");
}

export default async function Page({ params }: P) {
  return <OtherLivePage lang={await localeFrom(params)} id="punjab" />;
}
