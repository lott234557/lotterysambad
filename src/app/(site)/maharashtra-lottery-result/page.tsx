import { OtherLivePage, otherMetadata } from "@/views/others";

export const revalidate = 86400; // safety net only – pages are rebuilt on demand when a result arrives and once after midnight (src/lib/revalidate.ts)

export function generateMetadata() {
  return otherMetadata("en", "maharashtra");
}

export default function Page() {
  return <OtherLivePage lang="en" id="maharashtra" />;
}
