import { SiteChrome, siteMetadata } from "@/components/SiteChrome";

export const revalidate = 3600;

export function generateMetadata() {
  return siteMetadata("en");
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome lang="en">{children}</SiteChrome>;
}
