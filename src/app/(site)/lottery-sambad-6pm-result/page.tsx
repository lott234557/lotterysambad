import { SlotLivePage, slotMetadata } from "@/components/SlotLivePage";

export const revalidate = 1800;

export function generateMetadata() {
  return slotMetadata("6pm");
}

export default function Page() {
  return <SlotLivePage slot="6pm" />;
}
