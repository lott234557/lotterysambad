import { SlotLivePage, slotMetadata } from "@/views/result";
import { localeFrom, type LocaleParams } from "@/lib/i18n/route";

export const revalidate = 1800;
export const generateStaticParams = () => [];

type P = { params: LocaleParams };

export async function generateMetadata({ params }: P) {
  return slotMetadata(await localeFrom(params), "6pm");
}

export default async function Page({ params }: P) {
  const lang = await localeFrom(params);
  return <SlotLivePage lang={lang} slot="6pm" />;
}
