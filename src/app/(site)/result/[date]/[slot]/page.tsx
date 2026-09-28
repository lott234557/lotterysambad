import { DrawPage, drawMetadata, type DrawParams } from "@/views/result";

export const revalidate = 2592000; // past dates don't change – rebuilt on demand if a result is added/edited
export const generateStaticParams = () => [];

type P = { params: DrawParams };

export function generateMetadata({ params }: P) {
  return drawMetadata("en", params);
}

export default function Page({ params }: P) {
  return <DrawPage lang="en" params={params} />;
}
