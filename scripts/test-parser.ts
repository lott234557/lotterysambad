import { readFileSync } from "node:fs";
import { parsePage } from "../src/lib/scraper/parse";
import { confirmDate, pickDraw } from "../src/lib/scraper/sources";
import { checkTicket } from "../src/lib/draws";

let failed = 0;
const eq = (name: string, a: unknown, b: unknown) => {
  const ok = JSON.stringify(a) === JSON.stringify(b);
  if (!ok) failed++;
  console.log(`${ok ? "✔" : "✘"} ${name}${ok ? "" : ` — got ${JSON.stringify(a)} expected ${JSON.stringify(b)}`}`);
};
const load = (f: string) => readFileSync(new URL(`./fixtures/${f}`, import.meta.url), "utf8");

// 1. sambad.com today page (table based)
{
  const p = parsePage(load("sambad-today-1pm.html"), "https://sambad.com/today-1pm");
  const d = pickDraw(p.draws, "1pm", false)!;
  eq("today: first", d.first, "84L 10051");
  eq("today: cons", d.cons, "10051");
  eq("today: 2nd count", d.second.length, 10);
  eq("today: 3rd count", d.third.length, 10);
  eq("today: 4th count", d.fourth.length, 10);
  eq("today: 5th count", d.fifth.length, 100);
  eq("today: slot", d.slot, "1pm");
  eq("today: draw name", d.drawName, "Dear Victory Friday");
  eq("today: confirmed", confirmDate(p, "2026-09-25", "1pm", false).ok, true);
  eq("today: image found", p.images.some((i) => i.dateISO === "2026-09-25" && i.slot === "1pm"), true);
}
// 2. stale today page must be rejected
{
  const p = parsePage(load("sambad-today-1pm-stale.html"), "https://sambad.com/today-1pm");
  eq("stale: rejected", confirmDate(p, "2026-09-25", "1pm", false).ok, false);
}
// 3. multi-draw date page
{
  const p = parsePage(load("sambad-date.html"), "https://sambad.com/20-09-2026");
  eq("date: 3 draws", p.draws.length, 3);
  const d6 = pickDraw(p.draws, "6pm", true)!;
  eq("date: 6pm first", d6.first, "83E 65316");
  eq("date: 6pm name", d6.drawName, "Dear Empire Sunday");
  const d8 = pickDraw(p.draws, "8pm", true)!;
  eq("date: 8pm first", d8.first, "87A 37569");
  eq("date: 8pm 3rd", d8.third[0], "0461");
  eq("date: 1pm 2nd first", pickDraw(p.draws, "1pm", true)!.second[0], "09016");
  eq("date: confirmed 8pm", confirmDate(p, "2026-09-20", "8pm", true).ok, true);
}
// 4. lottery.sambad.com style (no prize table -> text fallback)
{
  const p = parsePage(load("lotterysambad-8pm.html"), "https://lottery.sambad.com/today/8-pm/");
  const d = pickDraw(p.draws, "8pm", false)!;
  eq("ls: first", d?.first, "96G 64500");
  eq("ls: 2nd", d?.second.length, 10);
  eq("ls: 3rd", d?.third, ["0748", "1246", "1709", "3599", "3950", "5439", "6031", "6248", "7083", "8807"]);
  eq("ls: drawNo", d?.drawNo, "51");
  eq("ls: jpg image", p.images.find((i) => i.url.endsWith(".jpg"))?.url, "https://lottery.sambad.com/images/lottery-sambad-8pm-25-09-2026.jpg");
  eq("ls: pdf", p.pdfs[0]?.url, "https://lottery.sambad.com/pdf/lottery-sambad-8pm-25-09-2026.pdf");
  eq("ls: confirmed", confirmDate(p, "2026-09-25", "8pm", false).ok, true);
}
// 4b. headline-only page with a menu mentioning every slot
{
  const html = `<html><body><nav><a>Home</a><a>1 PM Result</a><a>6 PM Result</a><a>8 PM Result</a></nav>
  <h1>Lottery Sambad Result Today 8 PM</h1><div>25/09/26</div><div class="big">96G 64500</div>
  <img src="/images/lottery-sambad-8pm-25-09-2026.jpg"><table><tr><td>24 Sep 2026</td><td>76C 18221</td></tr></table></body></html>`;
  const p = parsePage(html, "https://lottery.sambad.com/today/8-pm/");
  eq("headline: first", pickDraw(p.draws, "8pm", false)?.first, "96G 64500");
}
// 5. ticket checker
{
  const r = { firstPrize: "84L 10051", consPrize: "10051", secondPrize: ["10438"], thirdPrize: ["1570"], fourthPrize: ["0241"], fifthPrize: ["0153"] };
  eq("check: 1st", checkTicket("84L 10051", r).map((m) => m.tier.key), ["first"]);
  eq("check: cons", checkTicket("91A 10051", r).map((m) => m.tier.key), ["cons"]);
  eq("check: 2nd", checkTicket("12B 10438", r).map((m) => m.tier.key), ["second"]);
  eq("check: 3rd via last4", checkTicket("55C 31570", r).map((m) => m.tier.key), ["third"]);
  eq("check: none", checkTicket("55C 99999", r).length, 0);
}
console.log(failed ? `\n${failed} FAILED` : "\nAll parser tests passed");
process.exit(failed ? 1 : 0);
