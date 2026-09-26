import { ScheduleView, scheduleMetadata } from "@/views/pages";

export const revalidate = 86400;

export function generateMetadata() {
  return scheduleMetadata("en");
}

export default function Page() {
  return <ScheduleView lang="en" />;
}
