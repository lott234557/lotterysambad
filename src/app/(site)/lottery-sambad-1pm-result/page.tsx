import { SlotLivePage, slotMetadata } from "@/views/result";

export const revalidate = 86400; // safety net only – pages are rebuilt on demand when a result arrives and once after midnight (src/lib/revalidate.ts)

export function generateMetadata() {
  return slotMetadata("en", "1pm");
}

export default function Page() {
  return <SlotLivePage lang="en" slot="1pm" />;
}
