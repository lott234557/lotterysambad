"use client";
import { savePageAction } from "@/app/admin/actions";
import { ActionForm } from "./forms";
import { Field, Input, Select, Textarea, Panel, Toggle } from "./ui";
import { MarkdownEditor } from "./MarkdownEditor";
import type { Page } from "@/lib/db/schema";

export function PageForm({ p, flash }: { p?: Page | null; flash?: string }) {
  return (
    <ActionForm action={savePageAction} flash={flash} submitLabel={p ? "Save page" : "Create page"}>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Input name="title" defaultValue={p?.title ?? ""} placeholder="Page title" className="!py-3.5 !text-lg font-extrabold" required />
          <Field label="URL slug" hint="The page is served at /your-slug">
            <Input name="slug" defaultValue={p?.slug ?? ""} placeholder="privacy-policy" />
          </Field>
          <MarkdownEditor name="content" defaultValue={p?.content ?? ""} />
        </div>
        <div className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-4">
              <Field label="Status">
                <Select name="status" defaultValue={p?.status ?? "published"}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </Select>
              </Field>
              <Toggle name="showInFooter" defaultChecked={p?.showInFooter ?? true} label="Show in footer menu" />
              <Field label="Footer order"><Input type="number" name="sortOrder" defaultValue={p?.sortOrder ?? 10} /></Field>
            </div>
          </Panel>
          <Panel title="SEO">
            <div className="space-y-4">
              <Field label="Meta title"><Input name="metaTitle" defaultValue={p?.metaTitle ?? ""} /></Field>
              <Field label="Meta description"><Textarea name="metaDescription" defaultValue={p?.metaDescription ?? ""} className="min-h-20" /></Field>
            </div>
          </Panel>
        </div>
      </div>
    </ActionForm>
  );
}
