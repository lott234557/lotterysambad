import { SLOT_META, type Slot } from "./draws";
import type { QA } from "@/components/FAQ";
import { longDate } from "./time";
import type { Result } from "./db/schema";

/** Auto-generated, data-driven summary paragraph for a result. */
export function resultSummary(r: Result, firstAmount: string): string {
  const m = SLOT_META[r.slot as Slot];
  const parts = [
    `The Lottery Sambad ${m.label} result of ${longDate(r.drawDate)} (${r.drawName ?? "Dear Lottery"}) has been declared by the ${r.state ?? m.state} State Lottery.`,
  ];
  if (r.firstPrize) {
    parts.push(
      `The first prize of ${firstAmount} goes to ticket number ${r.firstPrize}. Tickets of other series ending with ${r.firstPrize.split(" ")[1]} win the consolation prize.`,
    );
  }
  const counts = [
    r.secondPrize.length && `${r.secondPrize.length} second-prize`,
    r.thirdPrize.length && `${r.thirdPrize.length} third-prize`,
    r.fourthPrize.length && `${r.fourthPrize.length} fourth-prize`,
    r.fifthPrize.length && `${r.fifthPrize.length} fifth-prize`,
  ].filter(Boolean);
  if (counts.length) parts.push(`This draw also has ${counts.join(", ")} winning numbers, all listed below along with the official result image.`);
  return parts.join(" ");
}

export const SLOT_INTRO: Record<Slot, string> = {
  "1pm":
    "The Lottery Sambad 1 PM draw – popularly called the Dear Morning or Dear 1 PM lottery – is the first draw of the day, conducted by the Nagaland State Lottery at 1:00 PM IST. The result is usually declared within 5 to 15 minutes of the draw and is published here automatically, in text and image format.",
  "6pm":
    "The Lottery Sambad 6 PM draw, also known as the Dear Day or Dear Evening lottery, is held at 6:00 PM IST every day. It is the second draw of the day and the result normally comes out between 6:05 PM and 6:15 PM IST. This page updates on its own as soon as the numbers are declared.",
  "8pm":
    "The Lottery Sambad 8 PM draw, known as the Dear Night lottery, is the last and most popular draw of the day, conducted at 8:00 PM IST by the Nagaland State Lottery. Results generally appear between 8:05 PM and 8:15 PM IST – keep this page open and it will refresh automatically.",
};

export function slotFaqs(slot: Slot, prizes: Record<string, string>): QA[] {
  const m = SLOT_META[slot];
  return [
    {
      q: `What time is the Lottery Sambad ${m.label} result declared?`,
      a: `The ${m.label} draw takes place at ${m.time} IST and the result is usually declared between ${m.expected} IST. We publish it on this page within a minute of the official announcement.`,
    },
    {
      q: `How can I check my Lottery Sambad ${m.label} ticket?`,
      a: `Type your full ticket number (for example 84L 10051) or its last 4–5 digits in the “Check your ticket” box on this page. Matching numbers are highlighted instantly in the prize list. You can also use our Ticket Checker for any old date.`,
    },
    {
      q: "How much is the first prize in Lottery Sambad?",
      a: `The first prize is ${prizes.first}. The consolation prize is ${prizes.cons}, the 2nd prize is ${prizes.second}, the 3rd prize ${prizes.third}, the 4th prize ${prizes.fourth} and the 5th prize ${prizes.fifth} (amounts may change as per the official notification).`,
    },
    {
      q: `Where can I see old Lottery Sambad ${m.label} results?`,
      a: `Scroll down to the “Previous ${m.label} results” table on this page, or open the Old Results archive to browse any date and month.`,
    },
    {
      q: "Is this the official Lottery Sambad website?",
      a: "No. Lottery Sambad Plus is an independent information website made for educational purposes and result display only. We do not sell or promote lottery tickets. Always verify results with the official Government Gazette before claiming any prize.",
    },
  ];
}

export const HOME_FAQS: QA[] = [
  {
    q: "What is Lottery Sambad?",
    a: "Lottery Sambad is the popular name for the daily Dear Lottery results of the Nagaland and Sikkim State Lotteries. Three draws are held every day at 1 PM, 6 PM and 8 PM IST, and the results are widely followed in West Bengal, Nagaland, Sikkim, Punjab, Maharashtra and other states where these lotteries are legal.",
  },
  {
    q: "What time does the Lottery Sambad result come out today?",
    a: "The 1 PM result is usually out by 1:05–1:15 PM, the 6 PM result by 6:05–6:15 PM and the 8 PM result by 8:05–8:15 PM IST. Our pages update automatically the moment a result is declared.",
  },
  {
    q: "How do I check my lottery ticket online?",
    a: "Open the result of your draw time and use the “Check your ticket” box, or go to the Ticket Checker page, choose the date and draw, and enter your ticket number. Matching prizes are shown instantly.",
  },
  {
    q: "How can I claim a Lottery Sambad prize?",
    a: "Prizes up to ₹10,000 can usually be claimed from the authorised seller or agent. Higher prizes must be claimed from the Directorate of State Lotteries with the original ticket, identity proof and the prescribed claim form, generally within 30 days of the draw. Always check the official rules of the respective state.",
  },
  {
    q: "Where can I find Lottery Sambad old results?",
    a: "Our Old Results archive keeps every result by date and month – including the result image – so you can check any past draw quickly.",
  },
  {
    q: "Is lotterysambad.plus an official website?",
    a: "No. We are an independent information website created for educational purposes and result display only. We do not sell, promote or distribute lottery tickets. Please verify with the official Government Gazette.",
  },
];
