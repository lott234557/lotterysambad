"use client";
import { useRef, useState } from "react";
import { marked } from "marked";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Image as ImageIcon, Quote, Table, Eye, Pencil, Loader2 } from "lucide-react";
import { uploadMediaAction } from "@/app/admin/actions";

export function MarkdownEditor({ name, defaultValue = "", rows = 22 }: { name: string; defaultValue?: string; rows?: number }) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);

  const wrap = (before: string, after = before, placeholder = "text") => {
    const el = ta.current!;
    const { selectionStart: s, selectionEnd: e } = el;
    const sel = value.slice(s, e) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + before.length, s + before.length + sel.length);
    });
  };
  const line = (prefix: string) => {
    const el = ta.current!;
    const s = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    setValue(value.slice(0, s) + prefix + value.slice(s));
    requestAnimationFrame(() => el.focus());
  };
  const insert = (text: string) => {
    const el = ta.current!;
    const s = el.selectionStart;
    setValue(value.slice(0, s) + text + value.slice(el.selectionEnd));
    requestAnimationFrame(() => el.focus());
  };
  const upload = async (f: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", f);
    const r = await uploadMediaAction(fd);
    setUploading(false);
    if (r.url) insert(`\n![${f.name.replace(/\.[^.]+$/, "")}](${r.url})\n`);
    else alert(r.error ?? "Upload failed");
  };

  const B = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} title={title} aria-label={title} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface hover:text-ink">
      {children}
    </button>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface-2">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line px-2 py-1.5">
        <B onClick={() => line("## ")} title="Heading 2"><Heading2 className="size-4" /></B>
        <B onClick={() => line("### ")} title="Heading 3"><Heading3 className="size-4" /></B>
        <B onClick={() => wrap("**")} title="Bold"><Bold className="size-4" /></B>
        <B onClick={() => wrap("*")} title="Italic"><Italic className="size-4" /></B>
        <B onClick={() => line("- ")} title="Bullet list"><List className="size-4" /></B>
        <B onClick={() => line("1. ")} title="Numbered list"><ListOrdered className="size-4" /></B>
        <B onClick={() => line("> ")} title="Quote"><Quote className="size-4" /></B>
        <B onClick={() => wrap("[", "](https://)", "link text")} title="Link"><Link2 className="size-4" /></B>
        <B onClick={() => insert("\n| Column 1 | Column 2 |\n| --- | --- |\n| Value | Value |\n")} title="Table"><Table className="size-4" /></B>
        <B onClick={() => file.current?.click()} title="Upload image">{uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}</B>
        <input ref={file} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <div className="ml-auto flex rounded-lg bg-surface p-0.5 text-xs font-bold">
          <button type="button" onClick={() => setTab("write")} className={`flex items-center gap-1 rounded-md px-2.5 py-1 ${tab === "write" ? "bg-navy text-white" : "text-muted"}`}>
            <Pencil className="size-3" /> Write
          </button>
          <button type="button" onClick={() => setTab("preview")} className={`flex items-center gap-1 rounded-md px-2.5 py-1 ${tab === "preview" ? "bg-navy text-white" : "text-muted"}`}>
            <Eye className="size-3" /> Preview
          </button>
        </div>
      </div>
      <textarea
        ref={ta}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={rows}
        className={`${tab === "write" ? "block" : "hidden"} w-full resize-y bg-transparent p-4 font-mono text-[0.85rem] leading-relaxed outline-none`}
        placeholder="Write in Markdown…  ## Heading, **bold**, - list, [link](https://…)"
      />
      {tab === "preview" && <div className="prose-x min-h-64 bg-surface p-5" dangerouslySetInnerHTML={{ __html: marked.parse(value, { async: false }) as string }} />}
      <div className="border-t border-line px-3 py-1.5 text-[0.7rem] text-muted">{value.trim().split(/\s+/).filter(Boolean).length} words · Markdown & HTML supported</div>
    </div>
  );
}
