import { SiteChrome, siteMetadata } from "@/components/SiteChrome";
import { isPrefixed } from "@/lib/i18n/config";


type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P) {
  const { slug } = await params;
  return siteMetadata(isPrefixed(slug) ? slug : "en");
}

/** /hi, /bn, /ml → localised site; any other slug → English CMS page. */
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <SiteChrome lang={isPrefixed(slug) ? slug : "en"}>{children}</SiteChrome>;
}
