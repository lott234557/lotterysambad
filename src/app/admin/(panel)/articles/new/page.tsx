import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { PostForm } from "@/components/admin/PostForm";

export default function NewArticle() {
  return (
    <>
      <PageHeader title="New article" actions={<Link href="/admin/articles" className="btn btn-ghost !py-2 text-sm">← All articles</Link>} />
      <PostForm />
    </>
  );
}
