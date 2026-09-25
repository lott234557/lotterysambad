import { getSettingsFresh, AD_SLOTS, siteUrl } from "@/lib/settings";
import { PageHeader, Panel, Field, Input, Textarea } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function Ads() {
  const s = await getSettingsFresh();
  return (
    <>
      <PageHeader title="Ads & ads.txt" desc={<>Manage Google AdSense (or any network) and your <a href="/ads.txt" target="_blank" className="text-brand-2 underline">ads.txt</a>.</>} />
      <SettingsForm section="ads">
        <Panel title="Google AdSense" desc="When a publisher ID is set, the AdSense script and the site-verification meta tag are added to every page (Auto ads can be switched on inside your AdSense account).">
          <Field label="AdSense publisher ID" hint="Format: ca-pub-1234567890123456">
            <Input name="adsenseClient" defaultValue={s.adsenseClient} placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="num" />
          </Field>
        </Panel>
        <Panel title="ads.txt" desc={<>Served at <b>{siteUrl()}/ads.txt</b>. If empty and a publisher ID is set, the Google line is generated automatically.</>}>
          <Textarea name="adsTxt" defaultValue={s.adsTxt} className="num min-h-40 text-xs" placeholder="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0" />
        </Panel>
        <Panel title="Ad placements" desc="Paste the ad unit code (HTML + script) for each position. Leave empty to hide the slot.">
          <div className="grid gap-5 md:grid-cols-2">
            {AD_SLOTS.map((a) => (
              <Field key={a.key} label={a.label} hint={a.hint}>
                <Textarea name={`ad_${a.key}`} defaultValue={s.adSlots[a.key]} className="num min-h-28 text-xs" placeholder={'<ins class="adsbygoogle" …></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'} />
              </Field>
            ))}
          </div>
        </Panel>
      </SettingsForm>
    </>
  );
}
