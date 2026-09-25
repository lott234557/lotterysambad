"use client";
import { useState } from "react";
import { savePostAction, uploadMediaAction } from "@/app/admin/actions";
import { ActionForm } from "./forms";
import { Field, Input, Select, Textarea, Panel } from "./ui";
import { MarkdownEditor } from "./MarkdownEditor";
import type { Post } from "@/lib/db/schema";

export function PostForm({ p, flash }: { p?: Post | null; flash?: string }) {
  const [cover, setCover] = useState(p?.coverImage ?? "");
  const [title, setTitle] = useState(p?.title ?? "");
  const [slug, setSlug] = useState(p?.slug ?? "");
  const [touched, setTouched] = useState(!!p);
  const auto = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (
    <ActionForm action={savePostAction} flash={flash} submitLabel={p ? "Save article" : "Create article"}>
      {p && <input type="hidden" name="id" value={p.id} />}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Input name="title" value={title} onChange={(e) => { setTitle(e.target.value); if (!touched) setSlug(auto(e.target.value)); }} placeholder="Article title" className="!py-3.5 !text-lg font-extrabold" required />
          <Field label="URL slug" hint={`/blog/${slug || "your-slug"}`}>
            <Input name="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setTouched(true); }} />
          </Field>
          <MarkdownEditor name="content" defaultValue={p?.content ?? ""} />
          <Field label="Excerpt" hint="Short summary shown in listings.">
            <Textarea name="excerpt" defaultValue={p?.excerpt ?? ""} className="min-h-20" />
          </Field>
        </div>
        <div className="space-y-6">
          <Panel title="Publishing">
            <Field label="Status">
              <Select name="status" defaultValue={p?.status ?? "draft"}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </Field>
          </Panel>
          <Panel title="Cover image">
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="mb-3 w-full rounded-xl border border-line" />
            )}
            <input type="hidden" name="coverImage" value={cover} />
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-3 file:py-2 file:text-sm file:font-bold file:text-gold"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const fd = new FormData();
                fd.append("file", f);
                const r = await uploadMediaAction(fd);
                if (r.url) setCover(r.url);
                else alert(r.error);
              }}
            />
            {cover && <button type="button" className="mt-2 text-xs text-live" onClick={() => setCover("")}>Remove cover</button>}
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
