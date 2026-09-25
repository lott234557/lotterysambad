import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { ResultForm } from "@/components/admin/ResultForm";
import { todayIST } from "@/lib/time";

export default function NewResult() {
  return (
    <>
      <PageHeader title="Add result" desc="Create a result manually (useful if a source is down)." actions={<Link href="/admin/results" className="btn btn-ghost !py-2 text-sm">← All results</Link>} />
      <ResultForm today={todayIST()} />
    </>
  );
}
