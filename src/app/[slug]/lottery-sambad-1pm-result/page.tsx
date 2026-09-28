import { SlotLivePage, slotMetadata } from "@/views/result";
import { localeFrom, type LocaleParams } from "@/lib/i18n/route";

export const revalidate = 86400; // safety net only – pages are rebuilt on demand when a result arrives and once after midnight (src/lib/revalidate.ts)
export const generateStaticParams = () => [];

type P = { params: LocaleParams };

export async function generateMetadata({ params }: P) {
  return slotMetadata(await localeFrom(params), "1pm");
}

export default async function Page({ params }: P) {
  const lang = await localeFrom(params);
  return <SlotLivePage lang={lang} slot="1pm" />;
}
