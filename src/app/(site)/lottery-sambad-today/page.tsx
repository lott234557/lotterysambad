import { TodayPage, todayMetadata } from "@/views/day";

export const revalidate = 1800;

export function generateMetadata() {
  return todayMetadata("en");
}

export default function Page() {
  return <TodayPage lang="en" />;
}
