import { ArchiveIndex, archiveIndexMetadata } from "@/views/archive";

export const revalidate = 3600;

export function generateMetadata() {
  return archiveIndexMetadata("en");
}

export default function Page() {
  return <ArchiveIndex lang="en" />;
}
