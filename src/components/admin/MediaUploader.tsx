"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { uploadMediaAction } from "@/app/admin/actions";
import { CopyField } from "./forms";

export function MediaUploader() {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const router = useRouter();
  return (
    <div className="space-y-3">
      <label className="btn btn-gold cursor-pointer !py-2">
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload image
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            setBusy(true);
            const fd = new FormData();
            fd.append("file", f);
            const r = await uploadMediaAction(fd);
            setBusy(false);
            if (r.url) {
              setUrl(r.url);
              router.refresh();
            } else alert(r.error);
          }}
        />
      </label>
      {url && <CopyField value={url} />}
    </div>
  );
}
