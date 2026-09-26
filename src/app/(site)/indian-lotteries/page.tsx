import { IndiaView, indiaMetadata } from "@/views/india";

export const revalidate = 86400;

export function generateMetadata() {
  return indiaMetadata("en");
}

export default function Page() {
  return <IndiaView lang="en" />;
}
