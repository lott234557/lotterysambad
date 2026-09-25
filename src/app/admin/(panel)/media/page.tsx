import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { formatIST } from "@/lib/time";
import { PageHeader, Badge } from "@/components/admin/ui";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { ConfirmButton } from "@/components/admin/forms";
import { deleteMediaAction } from "@/app/admin/actions";

export default async function Media() {
  const rows = await db
    .select({ id: media.id, key: media.key, size: media.size, width: media.width, height: media.height, storage: media.storage, createdAt: media.createdAt })
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(120);
  return (
    <>
      <PageHeader title="Media" desc={`Images are converted to WebP and served from /media/… (${process.env.BLOB_READ_WRITE_TOKEN ? "stored in Vercel Blob" : "stored in the database"}).`} actions={<MediaUploader />} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {rows.map((m) => (
          <div key={m.id} className="card overflow-hidden">
            <a href={`/media/${m.key}`} target="_blank" className="block aspect-square bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/media/${m.key}`} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
            </a>
            <div className="space-y-1 p-2.5 text-[0.7rem]">
              <div className="truncate font-semibold" title={m.key}>{m.key.split("/").pop()}</div>
              <div className="flex items-center justify-between text-muted">
                <span>{(m.size / 1024).toFixed(0)} KB {m.width ? `· ${m.width}×${m.height}` : ""}</span>
                <Badge>{m.storage}</Badge>
              </div>
              <div className="text-muted">{formatIST(m.createdAt)}</div>
              {m.key.startsWith("uploads/") && (
                <form action={deleteMediaAction}>
                  <input type="hidden" name="key" value={m.key} />
                  <ConfirmButton message="Delete this image?" className="text-live">Delete</ConfirmButton>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
      {rows.length === 0 && <div className="card p-10 text-center text-muted">No media yet.</div>}
    </>
  );
}
