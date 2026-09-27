import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { OtherDrawForm } from "@/components/admin/OtherDrawForm";
import { isOtherId } from "@/lib/others/config";
import { todayIST } from "@/lib/time";

export default async function NewOtherDraw({ searchParams }: { searchParams: Promise<{ l?: string }> }) {
  const { l } = await searchParams;
  const lottery = isOtherId(l) ? l : "kerala";
  return (
    <>
      <PageHeader
        title="Add lottery result"
        desc="Paste the result text to fill the prize tiers automatically, or type them in."
        actions={
          <Link href={`/admin/lotteries?l=${lottery}`} className="btn btn-ghost !py-2 text-sm">
            ← All
          </Link>
        }
      />
      <OtherDrawForm lottery={lottery} today={todayIST()} />
    </>
  );
}
