import { YesterdayPage, yesterdayMetadata } from "@/views/day";

export const revalidate = 3600;

export function generateMetadata() {
  return yesterdayMetadata("en");
}

export default function Page() {
  return <YesterdayPage lang="en" />;
}
