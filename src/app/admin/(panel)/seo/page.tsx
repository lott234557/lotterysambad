import { getSettingsFresh, siteUrl } from "@/lib/settings";
import { PageHeader, Panel, Field, Input, Textarea } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { randomUUID } from "node:crypto";

export default async function Seo() {
  const s = await getSettingsFresh();
  const suggestion = randomUUID().replace(/-/g, "");
  return (
    <>
      <PageHeader
        title="SEO & Analytics"
        desc={<>Sitemap: <a className="text-brand-2 underline" href="/sitemap.xml" target="_blank">{siteUrl()}/sitemap.xml</a> (updates automatically after every new result) · <a className="text-brand-2 underline" href="/robots.txt" target="_blank">robots.txt</a></>}
      />
      <SettingsForm section="seo">
        <Panel title="Google Analytics 4">
          <Field label="Measurement ID" hint="Format: G-XXXXXXXXXX">
            <Input name="gaId" defaultValue={s.gaId} placeholder="G-XXXXXXXXXX" className="num" />
          </Field>
        </Panel>
        <Panel title="Search engine verification" desc="Paste only the content value, or the whole meta tag.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Google Search Console"><Input name="gscVerification" defaultValue={s.gscVerification} /></Field>
            <Field label="Bing Webmaster (msvalidate.01)"><Input name="bingVerification" defaultValue={s.bingVerification} /></Field>
          </div>
        </Panel>
        <Panel title="IndexNow (Bing, Yandex)" desc="New result pages are submitted instantly when a key is set.">
          <Field label="IndexNow key" hint={<>Suggested key: <code className="num">{suggestion}</code> – key file is served at /indexnow-key.txt</>}>
            <Input name="indexNowKey" defaultValue={s.indexNowKey} className="num" />
          </Field>
        </Panel>
        <Panel title="robots.txt extra rules" desc="One per line, e.g. “Disallow: /private”. /admin and /api are always blocked.">
          <Textarea name="robotsExtra" defaultValue={s.robotsExtra} className="num text-xs" />
        </Panel>
        <Panel title="Custom code (end of body)" desc="Any extra script, e.g. push notifications or chat widgets. Runs on public pages only.">
          <Textarea name="bodyEndCode" defaultValue={s.bodyEndCode} className="num min-h-32 text-xs" />
        </Panel>
      </SettingsForm>
    </>
  );
}
