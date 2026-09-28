import { ChartView, chartMetadata } from "@/views/pages";

export const revalidate = 86400; // safety net only – pages are rebuilt on demand when a result arrives and once after midnight (src/lib/revalidate.ts)

export function generateMetadata() {
  return chartMetadata("en");
}

export default function Page() {
  return <ChartView lang="en" />;
}
