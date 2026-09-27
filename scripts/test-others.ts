/* Parser tests for Kerala / Maharashtra / Punjab sources:  npx tsx scripts/test-others.ts */
import { readFileSync } from "node:fs";
import { htmlToText, parseKerala, parseSections, parseTiers, mentionsDate, pageTitle, pageImages, formatAmount, isCompleteTiers, firstPrizeOf, punjabKey } from "../src/lib/others/parse";

const f = (n: string) => readFileSync(`scripts/fixtures/others/${n}`, "utf8");
let fail = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) fail++;
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : `\n   got:  ${JSON.stringify(got)}\n   want: ${JSON.stringify(want)}`}`);
};

// amounts
eq("amount crore", formatAmount("Rs.1,00,00,000/- [1 Crore]"), "₹1 Crore");
eq("amount lakh", formatAmount("Rs :3000000/-"), "₹30 Lakh");
eq("amount small", formatAmount("₹ 2,500"), "₹2,500");
eq("amount words", formatAmount("of ₹21 Lakh was won"), "₹21 Lakh");

// Kerala
const kh = f("kerala-sk71.html");
const kt = htmlToText(kh);
eq("kerala date", mentionsDate(kt, "2026-09-25"), true);
eq("kerala other date", mentionsDate(kt, "2026-09-24"), false);
const k = parseKerala(kt, pageTitle(kh))!;
eq("kerala name", [k.name, k.key, k.code], ["Suvarna Keralam SK-71", "sk-71", "SK-71"]);
eq("kerala labels", k.tiers.map((t) => t.label), ["1st Prize", "Consolation Prize", "2nd Prize", "3rd Prize", "4th Prize", "5th Prize", "6th Prize", "7th Prize", "8th Prize", "9th Prize"]);
eq("kerala 1st", k.tiers[0].numbers, ["RA 494226 (ATTINGAL)"]);
eq("kerala 1st amount", k.tiers[0].amount, "₹1 Crore");
eq("kerala cons", k.tiers[1].numbers.length, 11);
eq("kerala 2nd", [k.tiers[2].numbers, k.tiers[2].amount], [["RE 800768 (ALAPPUZHA)"], "₹30 Lakh"]);
eq("kerala counts", k.tiers.slice(4).map((t) => [t.numbers.length, t.expected]), [[19, 19], [6, 6], [25, 25], [76, 76], [92, 92], [144, 144]]);
eq("kerala complete", isCompleteTiers("kerala", k.tiers, false), true);
eq("kerala first", firstPrizeOf(k.tiers), "RA 494226");

// Maharashtra
const mt = htmlToText(f("maharashtra-weekly-2026-09-25.html"));
eq("maha date", mentionsDate(mt, "2026-09-25"), true);
const ms = parseSections(mt, "maharashtra", "2026-09-25");
eq("maha wrong date", parseSections(mt.replace(/25 Sep 2026|September 25, 2026|25 Sep/g, "x"), "maharashtra", "2026-09-26").length, 4);
eq("section other date", parseSections("Gajlaxmi Guru Weekly Lottery 24 Sep 2026\n1st Prize ₹10,000 GL-09-1111", "maharashtra", "2026-09-25").length, 0);
eq("maha draws", ms.map((d) => [d.key, d.name, d.time, d.tiers.length, firstPrizeOf(d.tiers)]), [
  ["vaibhavlaxmi", "Vaibhavlaxmi Weekly", "4:15 PM", 7, "VL-08-6375"],
  ["sahyadri-rajlaxmi", "Sahyadri Rajlaxmi Weekly", "4:30 PM", 5, "SR-05-3535"],
  ["gajlaxmi-shukra", "Gajlaxmi Shukra Weekly", "4:45 PM", 5, "GL-05-5637"],
  ["ganeshlaxmi-dhan", "Ganeshlaxmi Dhan Weekly", "5:00 PM", 6, "MG-04-9128"],
]);
eq("maha cons", ms[0].tiers[1].numbers.length, 9);
eq("maha 6th", ms[3].tiers[5].numbers.includes("0029"), true);
eq("maha counts", ms.map((d) => d.tiers.map((t) => t.numbers.length)), [[1, 9, 1, 1, 10, 10, 10], [1, 1, 10, 10, 10], [1, 1, 1, 10, 10], [1, 1, 1, 1, 10, 10]]);
eq("maha amounts", ms[0].tiers.map((t) => t.amount), ["₹7 Lakh", "₹2,500", "₹7,000", "₹5,000", "₹2,000", "₹500", "₹200"]);

// Punjab
const pt = htmlToText(f("punjab-gr-weekly-2026-09-26.html"));
const pd = parseTiers(pt, "punjab");
const psec = parseSections(pt, "punjab", "2026-09-26");
eq("punjab sections", psec.map((d) => [d.key, firstPrizeOf(d.tiers), d.time]), [["dear-50-jackal", "B 11949", "6:30 PM"]]);
eq("punjab first", [pd[0]?.label, pd[0]?.numbers, pd[0]?.amount], ["1st Prize", ["B 11949"], "₹21 Lakh"]);
eq("punjab only first", pd.length, 1);
eq("punjab key", punjabKey("Punjab State Dear 50 Jackal Saturday Weekly Lottery Result 6:30pm 26-09-2026 Declared"), "dear-50-jackal");
eq("punjab key monthly", punjabKey("Punjab State Dear 100 Monthly Lottery Result 08-09-2026 Declared"), "dear-100-monthly");
eq("punjab image", pageImages(f("punjab-news-post.html"), "https://www.punjablotterynews.com/x/")[0], "https://www.punjablotterynews.com/wp-content/uploads/2026/09/IMG-20260926-WA0026.jpg");

// pasted plain text (admin import)
const pasted = `SUVARNA KERALAM SK-71 25/09/2026
1st Prize Rs.1,00,00,000/- RA 494226 (ATTINGAL)
Consolation Prize Rs.5,000/- RB 494226 RC 494226
2nd Prize Rs.30,00,000/- RE 800768
4th Prize Rs.5,000/- 0024 0069 1008`;
const pk = parseKerala(pasted)!;
eq("paste kerala", [pk.name, pk.tiers.map((t) => t.numbers.length)], ["Suvarna Keralam SK-71", [1, 2, 1, 3]]);

console.log(fail ? `\n${fail} failed` : "\nall passed");
process.exit(fail ? 1 : 0);
