import { DrawPage, drawMetadata, type DrawParams } from "@/views/result";
import { localeFrom } from "@/lib/i18n/route";

export const revalidate = 2592000; // past dates don't change – rebuilt on demand if a result is added/edited
export const generateStaticParams = () => [];

type P = { params: Promise<{ date: string; slot: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  return drawMetadata(await localeFrom(params), params as DrawParams);
}

export default async function Page({ params }: P) {
  const lang = await localeFrom(params);
  return <DrawPage lang={lang} params={params as DrawParams} />;
}
