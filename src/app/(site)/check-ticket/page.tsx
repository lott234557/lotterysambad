import { CheckerView, checkerMetadata } from "@/views/pages";

export const revalidate = 3600;

export function generateMetadata() {
  return checkerMetadata("en");
}

export default function Page() {
  return <CheckerView lang="en" />;
}
