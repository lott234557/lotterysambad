"use client";
import { useState, useTransition } from "react";
import { Plus, Trash2, Wand2, ArrowUp, ArrowDown } from "lucide-react";
import { saveOtherDrawAction, parseOtherTextAction } from "@/app/admin/others-actions";
import { ActionForm } from "./forms";
import { Field, Input, Select, Textarea, Toggle, Panel } from "./ui";
import type { DrawTier, LotteryDraw } from "@/lib/db/schema";
import { OTHER, OTHER_IDS, type OtherId } from "@/lib/others/config";
const mediaUrl = (key: string | null | undefined) => (key ? `/media/${key}` : null);

const NAMES: Record<OtherId, string> = { kerala: "Kerala", punjab: "Punjab", maharashtra: "Maharashtra", westbengal: "West Bengal" };
const LABELS = ["1st Prize", "Consolation Prize", "2nd Prize", "3rd Prize", "4th Prize", "5th Prize", "6th Prize", "7th Prize", "8th Prize", "9th Prize", "10th Prize"];

type Row = { label: string; amount: string; numbers: string };
const toRows = (tiers: DrawTier[]): Row[] => tiers.map((t) => ({ label: t.label, amount: t.amount ?? "", numbers: t.numbers.join("\n") }));
const toTiers = (rows: Row[]): DrawTier[] =>
  rows
    .map((r) => ({
      label: r.label.trim(),
      amount: r.amount.trim() || undefined,
      numbers: r.numbers
        .split(/[\n,;]+|\s{2,}|(?<=\b\d{4,6})\s+(?=\d{4,6}\b)/)
        .map((n) => n.trim())
        .filter(Boolean),
    }))
    .filter((t) => t.label && t.numbers.length);

export function OtherDrawForm({ d, lottery, today, flash }: { d?: LotteryDraw | null; lottery: OtherId; today: string; flash?: string }) {
  const [lot, setLot] = useState<OtherId>((d?.lottery as OtherId) ?? lottery);
  const [rows, setRows] = useState<Row[]>(d ? toRows(d.tiers) : [{ label: "1st Prize", amount: "", numbers: "" }]);
  const [name, setName] = useState(d?.drawName ?? "");
  const [code, setCode] = useState(d?.drawCode ?? "");
  const [time, setTime] = useState(d?.drawTime ?? "");
  const [paste, setPaste] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const set = (i: number, k: keyof Row, v: string) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const move = (i: number, dir: -1 | 1) =>
    setRows((r) => {
      const n = [...r];
      const j = i + dir;
      if (j < 0 || j >= n.length) return r;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  const readPaste = () =>
    start(async () => {
      setMsg(null);
      const r = await parseOtherTextAction(lot, paste);
      if ("error" in r) return setMsg(r.error);
      const first = r.draws[0];
      setRows(toRows(first.tiers));
      if (first.name && !name) setName(first.name);
      if (first.code && !code) setCode(first.code);
      if (first.time && !time) setTime(first.time);
      setMsg(`Read ${first.tiers.length} prize tiers (${first.tiers.reduce((a, t) => a + t.numbers.length, 0)} numbers)${r.draws.length > 1 ? ` – ${r.draws.length} draws found, the first one was used` : ""}. Check and save.`);
    });

  return (
    <ActionForm action={saveOtherDrawAction} flash={flash} submitLabel={d ? "Save draw" : "Create draw"}>
      {d && <input type="hidden" name="id" value={d.id} />}
      <input type="hidden" name="tiers" value={JSON.stringify(toTiers(rows))} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel title="Draw">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Lottery">
                <Select name="lottery" value={lot} onChange={(e) => setLot(e.target.value as OtherId)}>
                  {OTHER_IDS.map((x) => (
                    <option key={x} value={x}>
                      {NAMES[x]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Draw date">
                <Input type="date" name="drawDate" defaultValue={d?.drawDate ?? today} max={today} required />
              </Field>
              <Field label="Draw name" hint="e.g. Suvarna Keralam SK-71 · Dear 50 Jackal Saturday Weekly · Vaibhavlaxmi Weekly">
                <Input name="drawName" value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Draw code">
                  <Input name="drawCode" value={code} onChange={(e) => setCode(e.target.value)} placeholder="SK-71" />
                </Field>
                <Field label="Draw time">
                  <Input name="drawTime" value={time} onChange={(e) => setTime(e.target.value)} placeholder="3:00 PM" />
                </Field>
              </div>
              <Field label="Type">
                <Select name="kind" defaultValue={d?.kind ?? (OTHER[lot].multi ? "weekly" : "daily")}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="bumper">Bumper</option>
                </Select>
              </Field>
              <Field label="Unique key" hint="Same key = same draw. Leave empty to use the code or name.">
                <Input name="drawKey" defaultValue={d?.drawKey ?? ""} placeholder="sk-71" />
              </Field>
            </div>
          </Panel>

          <Panel title="Paste result text" desc="Copy the full result from any website, PDF or message and paste it here – the prize tiers are filled in automatically.">
            <Textarea value={paste} onChange={(e) => setPaste(e.target.value)} className="min-h-32 text-xs" placeholder={"1st Prize Rs.1,00,00,000/- RA 494226 (ATTINGAL)\nConsolation Prize Rs.5,000/- RB 494226 RC 494226 …\n2nd Prize Rs.30,00,000/- RE 800768 …"} />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" disabled={pending || !paste.trim()} onClick={readPaste} className="btn btn-gold !py-2 text-sm">
                <Wand2 className="size-4" /> {pending ? "Reading…" : "Read prize list"}
              </button>
              {msg && <span className="text-xs text-muted">{msg}</span>}
            </div>
          </Panel>

          <Panel title="Prize tiers" desc="One tier per box. Numbers can be separated by new lines, commas or double spaces.">
            <div className="space-y-4">
              {rows.map((r, i) => (
                <div key={i} className="rounded-xl border border-line p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                    <Input list="tier-labels" value={r.label} onChange={(e) => set(i, "label", e.target.value)} placeholder="1st Prize" />
                    <Input value={r.amount} onChange={(e) => set(i, "amount", e.target.value)} placeholder="₹1 Crore" />
                    <div className="flex gap-1">
                      <button type="button" onClick={() => move(i, -1)} className="btn btn-ghost !px-2 !py-1.5" aria-label="Up">
                        <ArrowUp className="size-4" />
                      </button>
                      <button type="button" onClick={() => move(i, 1)} className="btn btn-ghost !px-2 !py-1.5" aria-label="Down">
                        <ArrowDown className="size-4" />
                      </button>
                      <button type="button" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="btn !px-2 !py-1.5 bg-live/10 text-live" aria-label="Remove">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <Textarea value={r.numbers} onChange={(e) => set(i, "numbers", e.target.value)} className="num mt-2 min-h-16 text-sm uppercase" placeholder="RA 494226 (ATTINGAL)" />
                  <div className="mt-1 text-[0.7rem] text-muted">{toTiers([r])[0]?.numbers.length ?? 0} numbers</div>
                </div>
              ))}
              <datalist id="tier-labels">
                {LABELS.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
              <button type="button" onClick={() => setRows((x) => [...x, { label: LABELS[Math.min(x.length, LABELS.length - 1)], amount: "", numbers: "" }])} className="btn btn-ghost !py-2 text-sm">
                <Plus className="size-4" /> Add tier
              </button>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-4">
              <Field label="Status">
                <Select name="status" defaultValue={d?.status ?? "published"}>
                  <option value="published">Published</option>
                  <option value="draft">Draft (hidden)</option>
                </Select>
              </Field>
              <Toggle name="manual" defaultChecked={d?.source === "manual"} label="Lock (manual)" hint="The scraper will never overwrite this draw." />
            </div>
          </Panel>
          <Panel title="Result image" desc="Optional – official result sheet.">
            {d?.imageKey && (
              <div className="mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mediaUrl(d.imageKey)!} alt="" className="max-h-64 w-full rounded-xl border border-line object-contain" />
                <div className="mt-2">
                  <Toggle name="removeImage" label="Remove this image" />
                </div>
              </div>
            )}
            <div className="space-y-3">
              <Input type="file" name="image" accept="image/*" />
              <Input name="imageUrl" placeholder="…or image URL" />
            </div>
          </Panel>
          <Panel title="Notes" desc="Optional text shown under the result (Markdown).">
            <Textarea name="notes" defaultValue={d?.notes ?? ""} className="min-h-24" />
          </Panel>
        </div>
      </div>
    </ActionForm>
  );
}
