import { OtherDatePage, otherDateMetadata, type OtherDateParams } from "@/views/others";

export const revalidate = 86400;
export const generateStaticParams = () => [];

type P = { params: OtherDateParams };

export function generateMetadata({ params }: P) {
  return otherDateMetadata("en", "kerala", params);
}

export default function Page({ params }: P) {
  return <OtherDatePage lang="en" id="kerala" params={params} />;
}
