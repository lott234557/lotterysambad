import { OtherDatePage, otherDateMetadata, type OtherDateParams } from "@/views/others";

export const revalidate = 2592000; // past dates don't change – rebuilt on demand if a result is added/edited
export const generateStaticParams = () => [];

type P = { params: OtherDateParams };

export function generateMetadata({ params }: P) {
  return otherDateMetadata("en", "westbengal", params);
}

export default function Page({ params }: P) {
  return <OtherDatePage lang="en" id="westbengal" params={params} />;
}
