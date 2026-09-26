import { ChartView, chartMetadata } from "@/views/pages";

export const revalidate = 3600;

export function generateMetadata() {
  return chartMetadata("en");
}

export default function Page() {
  return <ChartView lang="en" />;
}
