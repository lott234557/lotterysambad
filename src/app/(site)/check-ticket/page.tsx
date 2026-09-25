import type { Metadata } from "next";
import { getSettings, siteUrl } from "@/lib/settings";
import { todayIST } from "@/lib/time";
import { PageHero } from "@/components/PageHero";
import { TicketChecker } from "@/components/TicketChecker";
import { FAQ } from "@/components/FAQ";
import { Ad } from "@/components/Ad";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = "Lottery Sambad Ticket Checker – Check Your Ticket Online";
  const description = "Free Lottery Sambad ticket checker: choose the date and draw (1 PM, 6 PM or 8 PM), enter your ticket number and instantly see if you won any prize.";
  return { title: { absolute: `${title} | ${s.siteName}` }, description, alternates: { canonical: siteUrl() + "/check-ticket" }, openGraph: { title, description } };
}

export default async function Page() {
  const s = await getSettings();
  return (
    <>
      <PageHero
        crumbs={[{ name: "Ticket Checker" }]}
        eyebrow="Free tool"
        title="Lottery Sambad Ticket Checker"
        subtitle="Check whether your Dear Lottery ticket has won – for any date and any draw. Works with the full ticket number or just the last 4–5 digits."
      />
      <div className="wrap mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <TicketChecker today={todayIST()} prizes={s.prizes} />
          <Ad slot="inContent" />
          <section className="prose-x">
            <h2>How the ticket checker works</h2>
            <ol>
              <li><strong>1st prize:</strong> your complete ticket (series + 5 digits) must match exactly.</li>
              <li><strong>Consolation prize:</strong> the same 5 digits as the first prize, but a different series.</li>
              <li><strong>2nd prize:</strong> the last 5 digits of your ticket match.</li>
              <li><strong>3rd, 4th and 5th prize:</strong> the last 4 digits of your ticket match.</li>
            </ol>
            <p>The check runs in your browser – we never store the ticket numbers you type.</p>
          </section>
          <FAQ
            items={[
              { q: "Can I check an old ticket?", a: "Yes. Pick any past date and the draw time. If the result is in our archive, the checker will compare your ticket instantly." },
              { q: "Is the checker result final?", a: "No. It is for quick reference only. Always verify with the official Government Gazette before claiming a prize." },
            ]}
          />
        </div>
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Ad slot="sidebar" />
        </aside>
      </div>
    </>
  );
}
