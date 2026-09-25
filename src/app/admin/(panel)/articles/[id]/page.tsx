import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/ui";
import { PostForm } from "@/components/admin/PostForm";
import { ConfirmButton } from "@/components/admin/forms";
import { deletePostAction } from "@/app/admin/actions";

export default async function EditArticle({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const p = (await db.select().from(posts).where(eq(posts.id, Number(id))).limit(1))[0];
  if (!p) notFound();
  return (
    <>
      <PageHeader
        title="Edit article"
        actions={
          <>
            <form action={deletePostAction}>
              <input type="hidden" name="id" value={p.id} />
              <ConfirmButton message="Delete this article?" className="btn !py-2 text-sm bg-live/10 text-live">Delete</ConfirmButton>
            </form>
            <Link href="/admin/articles" className="btn btn-ghost !py-2 text-sm">← All articles</Link>
          </>
        }
      />
      <PostForm p={p} flash={saved ? "Article created." : undefined} />
    </>
  );
}
