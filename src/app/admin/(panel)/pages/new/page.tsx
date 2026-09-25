import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { PageForm } from "@/components/admin/PageForm";

export default function NewPage() {
  return (
    <>
      <PageHeader title="New page" actions={<Link href="/admin/pages" className="btn btn-ghost !py-2 text-sm">← All pages</Link>} />
      <PageForm />
    </>
  );
}
