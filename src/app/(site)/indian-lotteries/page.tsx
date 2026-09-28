import { IndiaView, indiaMetadata } from "@/views/india";

export const revalidate = 604800; // rebuilt on demand once after midnight

export function generateMetadata() {
  return indiaMetadata("en");
}

export default function Page() {
  return <IndiaView lang="en" />;
}
