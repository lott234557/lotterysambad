import type { Metadata, Viewport } from "next";
import "./globals.css";
import { jakarta, jbmono } from "@/lib/fonts";
import { siteUrl } from "@/lib/settings";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: "Lottery Sambad Plus",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#061a44" },
    { media: "(prefers-color-scheme: dark)", color: "#040c22" },
  ],
};

const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${jakarta.variable} ${jbmono.variable}`} suppressHydrationWarning>
      <head>
      <head>
  <script dangerouslySetInnerHTML={{ __html: themeScript }} />
  <script src="https://push.aplu.io/push-notify.js" async></script>
</head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
