import { ArchiveIndex, archiveIndexMetadata } from "@/views/archive";

export const revalidate = 86400; // safety net only – pages are rebuilt on demand when a result arrives and once after midnight (src/lib/revalidate.ts)

export function generateMetadata() {
  return archiveIndexMetadata("en");
}

export default function Page() {
  return <ArchiveIndex lang="en" />;
}
