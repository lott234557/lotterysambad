import { getSettingsFresh } from "@/lib/settings";
import { SLOTS, SLOT_META, TIERS } from "@/lib/draws";
import { WEEKDAYS } from "@/lib/time";
import { PageHeader, Panel, Field, Input, Textarea, Toggle } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const s = await getSettingsFresh();
  return (
    <>
      <PageHeader title="Settings" desc="Site identity, footer, social links, prize list and draw schedule." />
      <div className="space-y-10">
        <SettingsForm section="general">
          <Panel title="Site identity">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Site name"><Input name="siteName" defaultValue={s.siteName} /></Field>
              <Field label="Contact email"><Input name="contactEmail" type="email" defaultValue={s.contactEmail} /></Field>
              <Field label="Tagline / default meta description" className="md:col-span-2"><Input name="siteTagline" defaultValue={s.siteTagline} /></Field>
              <Field label="Custom logo URL" hint="Optional. Upload a logo in Media and paste its URL. Leave empty for the built-in logo." className="md:col-span-2">
                <Input name="logoUrl" defaultValue={s.logoUrl} placeholder="/media/uploads/logo.webp" />
              </Field>
            </div>
          </Panel>
          <Panel title="Footer">
            <div className="space-y-4">
              <Field label="About text"><Textarea name="footerAbout" defaultValue={s.footerAbout} /></Field>
              <Field label="Disclaimer (small text in footer)"><Textarea name="footerDisclaimer" defaultValue={s.footerDisclaimer} className="min-h-32" /></Field>
            </div>
          </Panel>
          <Panel title="Social links" desc="Shown as icons in the footer when filled.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Telegram channel"><Input name="telegram" defaultValue={s.social.telegram} placeholder="https://t.me/…" /></Field>
              <Field label="WhatsApp channel"><Input name="whatsapp" defaultValue={s.social.whatsapp} placeholder="https://whatsapp.com/channel/…" /></Field>
              <Field label="Facebook page"><Input name="facebook" defaultValue={s.social.facebook} /></Field>
              <Field label="YouTube"><Input name="youtube" defaultValue={s.social.youtube} /></Field>
              <Field label="X / Twitter"><Input name="x" defaultValue={s.social.x} /></Field>
            </div>
          </Panel>
        </SettingsForm>

        <SettingsForm section="results">
          <Panel title="Scraper">
            <div className="space-y-4">
              <Toggle name="scraperEnabled" defaultChecked={s.scraperEnabled} label="Automatic scraping enabled" hint="Turn off to stop all automatic fetching (manual results still work)." />
              <Toggle name="showImageCredit" defaultChecked={s.showImageCredit} label="Show image source under result images" hint="Displays the source domain as plain text." />
            </div>
          </Panel>
          <Panel title="Prize amounts" desc="Displayed on result pages and in FAQs.">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {TIERS.map((t) => (
                <Field key={t.key} label={t.label}><Input name={`prize_${t.key}`} defaultValue={s.prizes[t.key]} /></Field>
              ))}
            </div>
          </Panel>
          <Panel title="Weekly draw names" desc="Used when the source page does not show the draw name. “Dear” and the weekday are added automatically.">
            <div className="overflow-x-auto">
              <table className="table-x min-w-[520px] text-sm">
                <thead><tr><th>Day</th>{SLOTS.map((x) => <th key={x}>{SLOT_META[x].time}</th>)}</tr></thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                    <tr key={d}>
                      <td className="font-bold">{WEEKDAYS[d]}</td>
                      {SLOTS.map((x) => (
                        <td key={x}><Input name={`sch_${x}_${d}`} defaultValue={s.schedule[x][d]} className="!py-1.5" /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </SettingsForm>
      </div>
    </>
  );
}
