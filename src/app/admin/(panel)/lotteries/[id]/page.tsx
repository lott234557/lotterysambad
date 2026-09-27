import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { lotteryDraws } from "@/lib/db/schema";
import { PageHeader } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/forms";
import { OtherDrawForm } from "@/components/admin/OtherDrawForm";
import { OtherFetch } from "@/components/admin/OtherFetch";
import { deleteOtherDrawAction } from "@/app/admin/others-actions";
import { OTHER, isOtherId } from "@/lib/others/config";
import { isoToDMY, shortDate, todayIST } from "@/lib/time";

export default async function EditOtherDraw({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const d = (await db.select().from(lotteryDraws).where(eq(lotteryDraws.id, Number(id))).limit(1))[0];
  if (!d || !isOtherId(d.lottery)) notFound();
  return (
    <>
      <PageHeader
        title={`${d.drawName} · ${shortDate(d.drawDate)}`}
        desc={`${d.lottery} · key ${d.drawKey}${d.sourceUrl ? ` · ${d.sourceUrl}` : ""}`}
        actions={
          <>
            <a href={`${OTHER[d.lottery].path}/${isoToDMY(d.drawDate)}`} target="_blank" className="btn btn-ghost !py-2 text-sm">
              View
            </a>
            <form action={deleteOtherDrawAction}>
              <input type="hidden" name="id" value={d.id} />
              <ConfirmButton message="Delete this draw permanently?" className="btn !py-2 text-sm bg-live/10 text-live">
                Delete
              </ConfirmButton>
            </form>
            <Link href={`/admin/lotteries?l=${d.lottery}`} className="btn btn-ghost !py-2 text-sm">
              ← All
            </Link>
          </>
        }
      />
      {d.source !== "manual" && OTHER[d.lottery].window && (
        <div className="mb-4">
          <OtherFetch lottery={d.lottery} today={d.drawDate > todayIST() ? todayIST() : d.drawDate} compact />
        </div>
      )}
      <OtherDrawForm d={d} lottery={d.lottery} today={todayIST()} flash={saved ? "Draw created." : undefined} />
    </>
  );
}
