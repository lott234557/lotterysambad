import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { formatIST } from "@/lib/time";
import { PageHeader, Badge } from "@/components/admin/ui";
import { Plus } from "lucide-react";

export default async function Articles() {
  const rows = await db.select({ id: posts.id, title: posts.title, slug: posts.slug, status: posts.status, updatedAt: posts.updatedAt }).from(posts).orderBy(desc(posts.updatedAt));
  return (
    <>
      <PageHeader title="Articles" desc="Guides and updates shown under /blog." actions={<Link href="/admin/articles/new" className="btn btn-gold !py-2 text-sm"><Plus className="size-4" /> New article</Link>} />
      <div className="card overflow-x-auto">
        <table className="table-x min-w-[640px] text-sm">
          <thead><tr><th>Title</th><th>Status</th><th>Updated</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-muted">No articles yet.</td></tr>}
            {rows.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/admin/articles/${p.id}`} className="font-bold hover:text-brand-2">{p.title}</Link><div className="text-xs text-muted">/blog/{p.slug}</div></td>
                <td>{p.status === "published" ? <Badge tone="ok">published</Badge> : <Badge>draft</Badge>}</td>
                <td className="text-xs text-muted">{formatIST(p.updatedAt)}</td>
                <td className="text-right space-x-1.5">
                  <Link href={`/admin/articles/${p.id}`} className="btn btn-ghost !px-2.5 !py-1.5 text-xs">Edit</Link>
                  {p.status === "published" && <a href={`/blog/${p.slug}`} target="_blank" className="btn btn-ghost !px-2.5 !py-1.5 text-xs">View</a>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
