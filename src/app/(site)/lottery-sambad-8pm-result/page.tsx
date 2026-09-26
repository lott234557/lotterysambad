import { SlotLivePage, slotMetadata } from "@/views/result";

export const revalidate = 1800;

export function generateMetadata() {
  return slotMetadata("en", "8pm");
}

export default function Page() {
  return <SlotLivePage lang="en" slot="8pm" />;
}
