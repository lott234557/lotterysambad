"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { scrapeNowAction } from "@/app/admin/actions";

export function ScrapeButton({ date, slot, label = "Fetch now", small = false }: { date: string; slot: string; label?: string; small?: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await scrapeNowAction(date, slot);
            setMsg("error" in r ? r.error : `${r.status}: ${r.message}`);
            router.refresh();
          })
        }
        className={`btn btn-ghost ${small ? "!px-2.5 !py-1.5 text-xs" : "!py-2 text-sm"}`}
      >
        <RefreshCw className={`size-3.5 ${pending ? "animate-spin" : ""}`} /> {pending ? "Fetching…" : label}
      </button>
      {msg && <span className="text-[0.7rem] text-muted">{msg}</span>}
    </div>
  );
}
