import Script from "next/script";
import type { Metadata } from "next";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import { Ad } from "./Ad";
import { BodyCode } from "./BodyCode";
import { getSettings } from "@/lib/settings";
import { getDict, HREFLANG, type Locale } from "@/lib/i18n";
import { bottomNav } from "@/lib/nav";

/** Shared public chrome (header, footer, ads, analytics) for every language. */
export async function SiteChrome({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  const s = await getSettings();
  const t = getDict(lang);
  return (
    <>
      {lang !== "en" && <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang="${HREFLANG[lang]}"` }} />}
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-gold focus:px-3 focus:py-2 focus:text-black">
        {t.common.skip}
      </a>
      <Header lang={lang} siteName={s.siteName} logoUrl={s.logoUrl} />
      <Ad slot="headerBelow" className="wrap pt-4" />
      <main id="main" lang={HREFLANG[lang]}>
        {children}
      </main>
      <Ad slot="footerAbove" className="wrap pt-10" />
      <Footer s={s} lang={lang} />
      <BottomNav items={bottomNav(lang, t)} />

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

export async function siteMetadata(lang: Locale): Promise<Metadata> {
  const s = await getSettings();
  const t = getDict(lang);
  const other: Record<string, string> = {};
  if (s.bingVerification) other["msvalidate.01"] = s.bingVerification;
  if (s.adsenseClient) other["google-adsense-account"] = s.adsenseClient;
  return {
    title: {
      default: `${t.home.h1a} ${t.home.h1b} – 1 PM, 6 PM, 8 PM | ${s.siteName}`,
      template: `%s | ${s.siteName}`,
    },
    description: lang === "en" ? s.siteTagline : t.footer.about,
    applicationName: s.siteName,
    manifest: "/manifest.webmanifest",
    openGraph: { siteName: s.siteName, locale: HREFLANG[lang].replace("-", "_"), type: "website" },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    verification: { google: s.gscVerification || undefined, other },
  };
}
