import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/ui";
import { PageForm } from "@/components/admin/PageForm";
import { ConfirmButton } from "@/components/admin/forms";
import { deletePageAction } from "@/app/admin/actions";

export default async function EditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const p = (await db.select().from(pages).where(eq(pages.id, Number(id))).limit(1))[0];
  if (!p) notFound();
  return (
    <>
      <PageHeader
        title="Edit page"
        actions={
          <>
            <form action={deletePageAction}>
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton message="Delete this page?" className="btn !py-2 text-sm bg-live/10 text-live">Delete</ConfirmButton>
            </form>
            <Link href="/admin/pages" className="btn btn-ghost !py-2 text-sm">← All pages</Link>
          </>
        }
      />
      <PageForm p={p} flash={saved ? "Page created." : undefined} />
    </>
  );
}
