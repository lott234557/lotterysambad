import { ArchiveMonth, archiveMonthMetadata, type MonthParams } from "@/views/archive";

export const revalidate = 2592000; // past dates don't change – rebuilt on demand if a result is added/edited
export const generateStaticParams = () => [];

type P = { params: MonthParams };

export function generateMetadata({ params }: P) {
  return archiveMonthMetadata("en", params);
}

export default function Page({ params }: P) {
  return <ArchiveMonth lang="en" params={params} />;
}
