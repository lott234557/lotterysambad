import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages } from "@/lib/db/schema";
import { formatIST } from "@/lib/time";
import { PageHeader, Badge } from "@/components/admin/ui";
import { Plus } from "lucide-react";

export default async function Pages() {
  const rows = await db.select({ id: pages.id, title: pages.title, slug: pages.slug, status: pages.status, showInFooter: pages.showInFooter, updatedAt: pages.updatedAt }).from(pages).orderBy(asc(pages.sortOrder), asc(pages.title));
  return (
    <>
      <PageHeader title="Pages" desc="Legal & static pages (Privacy Policy, Disclaimer, DMCA, Content Policy…)." actions={<Link href="/admin/pages/new" className="btn btn-gold !py-2 text-sm"><Plus className="size-4" /> New page</Link>} />
      <div className="card overflow-x-auto">
        <table className="table-x min-w-[640px] text-sm">
          <thead><tr><th>Title</th><th>Status</th><th>Footer</th><th>Updated</th><th className="text-right">Actions</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/admin/pages/${p.id}`} className="font-bold hover:text-brand-2">{p.title}</Link><div className="text-xs text-muted">/{p.slug}</div></td>
                <td>{p.status === "published" ? <Badge tone="ok">published</Badge> : <Badge>draft</Badge>}</td>
                <td>{p.showInFooter ? <Badge tone="blue">yes</Badge> : <Badge>no</Badge>}</td>
                <td className="text-xs text-muted">{formatIST(p.updatedAt)}</td>
                <td className="text-right space-x-1.5">
                  <Link href={`/admin/pages/${p.id}`} className="btn btn-ghost !px-2.5 !py-1.5 text-xs">Edit</Link>
                  <a href={`/${p.slug}`} target="_blank" className="btn btn-ghost !px-2.5 !py-1.5 text-xs">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
