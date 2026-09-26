import { DatePage, dateMetadata, type DateParams } from "@/views/day";

export const revalidate = 86400;
export const generateStaticParams = () => [];

type P = { params: DateParams };

export function generateMetadata({ params }: P) {
  return dateMetadata("en", params);
}

export default function Page({ params }: P) {
  return <DatePage lang="en" params={params} />;
}
