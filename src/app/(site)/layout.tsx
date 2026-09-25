import type { Metadata } from "next";
import Script from "next/script";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { Ad } from "@/components/Ad";
import { BodyCode } from "@/components/BodyCode";
import { getSettings } from "@/lib/settings";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const other: Record<string, string> = {};
  if (s.bingVerification) other["msvalidate.01"] = s.bingVerification;
  if (s.adsenseClient) other["google-adsense-account"] = s.adsenseClient;
  return {
    title: { default: `Lottery Sambad Result Today – 1 PM, 6 PM, 8 PM | ${s.siteName}`, template: `%s | ${s.siteName}` },
    description: s.siteTagline,
    applicationName: s.siteName,
    manifest: "/manifest.webmanifest",
    openGraph: { siteName: s.siteName, locale: "en_IN", type: "website" },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    verification: { google: s.gscVerification || undefined, other },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-3 focus:py-2 focus:text-black">
        Skip to content
      </a>
      <Header siteName={s.siteName} logoUrl={s.logoUrl} />
      <Ad slot="headerBelow" className="wrap pt-4" />
      <main id="main">
        {children}
      </main>
      <Ad slot="footerAbove" className="wrap pt-10" />
      <Footer s={s} />
      <BottomNav />

      {s.gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${s.gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${s.gaId.replace(/[^A-Z0-9-]/gi, "")}');`}
          </Script>
        </>
      )}
      {s.adsenseClient && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${s.adsenseClient}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      {s.bodyEndCode && <BodyCode code={s.bodyEndCode} />}
    </>
  );
}
