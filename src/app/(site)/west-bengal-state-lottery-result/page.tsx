import { OtherLivePage, otherMetadata } from "@/views/others";

export const revalidate = 1800;

export function generateMetadata() {
  return otherMetadata("en", "westbengal");
}

export default function Page() {
  return <OtherLivePage lang="en" id="westbengal" />;
}
