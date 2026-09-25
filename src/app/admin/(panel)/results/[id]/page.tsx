import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { results } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/ui";
import { ResultForm } from "@/components/admin/ResultForm";
import { ConfirmButton } from "@/components/admin/forms";
import { ScrapeButton } from "@/components/admin/ScrapeButton";
import { deleteResultAction } from "@/app/admin/actions";
import { SLOT_META, type Slot } from "@/lib/draws";
import { isoToDMY, shortDate, todayIST } from "@/lib/time";

export default async function EditResult({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const r = (await db.select().from(results).where(eq(results.id, Number(id))).limit(1))[0];
  if (!r) notFound();
  return (
    <>
      <PageHeader
        title={`${SLOT_META[r.slot as Slot].label} · ${shortDate(r.drawDate)}`}
        desc={r.drawName}
        actions={
          <>
            <ScrapeButton date={r.drawDate} slot={r.slot} label="Re-fetch from source" />
            <a href={`/result/${isoToDMY(r.drawDate)}/${r.slot}`} target="_blank" className="btn btn-ghost !py-2 text-sm">View</a>
            <form action={deleteResultAction}>
              <input type="hidden" name="id" value={r.id} />
              <ConfirmButton message="Delete this result permanently?" className="btn !py-2 text-sm bg-live/10 text-live">Delete</ConfirmButton>
            </form>
            <Link href="/admin/results" className="btn btn-ghost !py-2 text-sm">← All</Link>
          </>
        }
      />
      <ResultForm r={r} today={todayIST()} flash={saved ? "Result created." : undefined} />
    </>
  );
}
