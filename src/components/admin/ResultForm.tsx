"use client";
import { saveResultAction } from "@/app/admin/actions";
import { ActionForm } from "./forms";
import { Field, Input, Select, Textarea, Toggle, Panel } from "./ui";
import type { Result } from "@/lib/db/schema";
import { SLOTS, SLOT_META } from "@/lib/draws";

export function ResultForm({ r, today, flash }: { r?: Result | null; today: string; flash?: string }) {
  return (
    <ActionForm action={saveResultAction} flash={flash} submitLabel={r ? "Save result" : "Create result"}>
      {r && <input type="hidden" name="id" value={r.id} />}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <Panel title="Draw">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Draw date">
                <Input type="date" name="drawDate" defaultValue={r?.drawDate ?? today} max={today} required />
              </Field>
              <Field label="Draw time">
                <Select name="slot" defaultValue={r?.slot ?? "1pm"}>
                  {SLOTS.map((s) => (
                    <option key={s} value={s}>{SLOT_META[s].time}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Draw name" hint="Leave empty to use the weekly schedule (e.g. Dear Victory Friday).">
                <Input name="drawName" defaultValue={r?.drawName ?? ""} placeholder="Dear Victory Friday" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Draw no.">
                  <Input name="drawNo" defaultValue={r?.drawNo ?? ""} placeholder="47" />
                </Field>
                <Field label="State">
                  <Input name="state" defaultValue={r?.state ?? ""} placeholder="Nagaland" />
                </Field>
              </div>
            </div>
          </Panel>
          <Panel title="Winning numbers" desc="Paste numbers separated by spaces, commas or new lines. Duplicates are removed automatically.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="1st prize (series + number)">
                <Input name="firstPrize" defaultValue={r?.firstPrize ?? ""} placeholder="84L 10051" className="num text-lg font-bold uppercase" />
              </Field>
              <Field label="Consolation prize (5 digits)" hint="Defaults to the 1st prize digits.">
                <Input name="consPrize" defaultValue={r?.consPrize ?? ""} placeholder="10051" className="num" />
              </Field>
            </div>
            <div className="mt-4 grid gap-4">
              <Field label={`2nd prize – 5 digits (${r?.secondPrize.length ?? 0})`}>
                <Textarea name="secondPrize" defaultValue={r?.secondPrize.join(" ") ?? ""} className="num min-h-16" />
              </Field>
              <Field label={`3rd prize – 4 digits (${r?.thirdPrize.length ?? 0})`}>
                <Textarea name="thirdPrize" defaultValue={r?.thirdPrize.join(" ") ?? ""} className="num min-h-16" />
              </Field>
              <Field label={`4th prize – 4 digits (${r?.fourthPrize.length ?? 0})`}>
                <Textarea name="fourthPrize" defaultValue={r?.fourthPrize.join(" ") ?? ""} className="num min-h-16" />
              </Field>
              <Field label={`5th prize – 4 digits (${r?.fifthPrize.length ?? 0})`}>
                <Textarea name="fifthPrize" defaultValue={r?.fifthPrize.join(" ") ?? ""} className="num min-h-32" />
              </Field>
            </div>
          </Panel>
          <Panel title="Extra content (optional)" desc="Markdown shown below the result – e.g. a note or correction.">
            <Textarea name="notes" defaultValue={r?.notes ?? ""} className="min-h-28" />
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-4">
              <Field label="Status">
                <Select name="status" defaultValue={r?.status ?? "published"}>
                  <option value="published">Published</option>
                  <option value="draft">Draft (hidden)</option>
                </Select>
              </Field>
              <Toggle name="manual" defaultChecked={r ? r.source === "manual" : true} label="Lock result" hint="The scraper will never overwrite a locked result." />
            </div>
          </Panel>
          <Panel title="Result image">
            {r?.imageKey && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/media/${r.imageKey}`} alt="" className="mb-3 w-full rounded-xl border border-line" />
                <Toggle name="removeImage" label="Remove current image" />
                <div className="h-4" />
              </>
            )}
            <Field label="Upload image" hint="JPG / PNG / WebP up to 8 MB – converted to optimised WebP.">
              <input type="file" name="image" accept="image/*" className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-3 file:py-2 file:text-sm file:font-bold file:text-gold" />
            </Field>
            <div className="h-4" />
            <Field label="…or import from URL">
              <Input name="imageUrl" placeholder="https://…/result.jpg" />
            </Field>
            {r?.imageSourceUrl && <p className="mt-3 break-all text-[0.7rem] text-muted">Source: {r.imageSourceUrl}</p>}
          </Panel>
        </div>
      </div>
    </ActionForm>
  );
}
