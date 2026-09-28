import { ScheduleView, scheduleMetadata } from "@/views/pages";

export const revalidate = 604800; // rebuilt on demand once after midnight

export function generateMetadata() {
  return scheduleMetadata("en");
}

export default function Page() {
  return <ScheduleView lang="en" />;
}
