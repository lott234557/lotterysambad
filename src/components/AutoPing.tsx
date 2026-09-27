"use client";
import { useEffect } from "react";
import { nowIST } from "@/lib/time";
import { dueSlots } from "@/lib/windows";
import { OTHER, OTHER_IDS, windowPhase } from "@/lib/others/config";

/**
 * Every page view during a draw window gives the server's auto-fetch a nudge (one request per page view,
 * served from the CDN for 15 s, so it costs nothing). Pages with a live result box poll on their own;
 * this covers all the other pages (old results, chart, guides, …).
 */
export function AutoPing() {
  useEffect(() => {
    const m = nowIST().minuteOfDay;
    const open = dueSlots(m).length > 0 || OTHER_IDS.some((id) => windowPhase(OTHER[id], m));
    if (!open) return;
    const t = setTimeout(() => {
      fetch("/api/status", { cache: "no-store", keepalive: true }).catch(() => {});
    }, 2500);
    return () => clearTimeout(t);
  }, []);
  return null;
}
