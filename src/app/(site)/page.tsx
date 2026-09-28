import { HomeView, homeMetadata } from "@/views/home";

export const revalidate = 86400; // safety net only – pages are rebuilt on demand when a result arrives and once after midnight (src/lib/revalidate.ts)

export function generateMetadata() {
  return homeMetadata("en");
}

export default function Home() {
  return <HomeView lang="en" />;
}
