"use client";
import { useState, useTransition } from "react";
import { RotateCw } from "lucide-react";
import { refreshSiteAction } from "@/app/admin/actions";

export function RefreshSite() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => {
          const r = await refreshSiteAction();
          setMsg(r.error ?? r.message ?? null);
        })}
        className="btn btn-ghost !py-2 text-sm"
        title="Re-check database and rebuild all public pages"
      >
        <RotateCw className={`size-4 ${pending ? "animate-spin" : ""}`} /> {pending ? "Refreshing…" : "Refresh website"}
      </button>
      {msg && <span className="text-xs text-muted">{msg}</span>}
    </div>
  );
}
