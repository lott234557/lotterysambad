/**
 * Facts about Indian state lotteries used on the home page and /indian-lotteries.
 * Figures are the latest publicly reported values (verified Sept 2026) and can change –
 * edit the numbers here and the wording in src/lib/i18n/lotteryText.ts when a department
 * announces new prizes.
 */

export type LotteryId = "sambad" | "sikkim" | "kerala" | "punjab" | "westbengal" | "maharashtra";

export type LotteryRow = {
  id: LotteryId;
  /** English state name (key into the localised state list) */
  state: string;
  drawsPerWeek: number | null;
  link?: string; // internal page with results
};

export const LOTTERIES: LotteryRow[] = [
  { id: "sambad", state: "Nagaland", drawsPerWeek: 14, link: "/" },
  { id: "sikkim", state: "Sikkim", drawsPerWeek: 7, link: "/lottery-sambad-6pm-result" },
  { id: "kerala", state: "Kerala", drawsPerWeek: 7, link: "/kerala-lottery-result" },
  { id: "punjab", state: "Punjab", drawsPerWeek: null, link: "/punjab-state-lottery-result" },
  { id: "westbengal", state: "West Bengal", drawsPerWeek: 7, link: "/west-bengal-state-lottery-result" },
  { id: "maharashtra", state: "Maharashtra", drawsPerWeek: null, link: "/maharashtra-lottery-result" },
];

export type PrizeKey =
  | "thiruvonam"
  | "xmas"
  | "vishu"
  | "pooja"
  | "pbDiwali"
  | "pbLohri"
  | "summer"
  | "monsoon"
  | "pbRakhi"
  | "dearPuja"
  | "sambadDaily"
  | "keralaWeekly";

/** Biggest first prizes (₹ crore) – Lottery Sambad draws are emphasised. */
export const TOP_PRIZES: { key: PrizeKey; crore: number; sambad?: boolean }[] = [
  { key: "thiruvonam", crore: 30 },
  { key: "xmas", crore: 20 },
  { key: "vishu", crore: 12 },
  { key: "pooja", crore: 12 },
  { key: "pbDiwali", crore: 11 },
  { key: "pbLohri", crore: 10 },
  { key: "summer", crore: 10 },
  { key: "monsoon", crore: 10 },
  { key: "pbRakhi", crore: 7 },
  { key: "dearPuja", crore: 3, sambad: true },
  { key: "sambadDaily", crore: 1, sambad: true },
  { key: "keralaWeekly", crore: 1 },
];

export type DrawKey = "s1" | "kerala" | "wb" | "s6" | "s8";

/** Daily result timeline (IST, minutes after midnight). */
export const DAILY_DRAWS: { key: DrawKey; minute: number; sambad?: boolean; href?: string }[] = [
  { key: "s1", minute: 13 * 60, sambad: true, href: "/lottery-sambad-1pm-result" },
  { key: "kerala", minute: 15 * 60, href: "/kerala-lottery-result" },
  { key: "wb", minute: 16 * 60, href: "/west-bengal-state-lottery-result" },
  { key: "s6", minute: 18 * 60, sambad: true, href: "/lottery-sambad-6pm-result" },
  { key: "s8", minute: 20 * 60, sambad: true, href: "/lottery-sambad-8pm-result" },
];

export const LEGAL_STATES = [
  "Arunachal Pradesh",
  "Assam",
  "Goa",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Punjab",
  "Sikkim",
  "West Bengal",
];

export const BANNED_STATES = [
  "Andhra Pradesh",
  "Bihar",
  "Chhattisgarh",
  "Gujarat",
  "Haryana",
  "Jharkhand",
  "Karnataka",
  "Odisha",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttarakhand",
  "Uttar Pradesh",
];

/** Kerala weekly lotteries (weekday index, 0 = Sunday). */
export const KERALA_WEEKLY = [
  { day: 1, name: "Bhagyathara" },
  { day: 2, name: "Sthree Sakthi" },
  { day: 3, name: "Dhanalekshmi" },
  { day: 4, name: "Karunya Plus" },
  { day: 5, name: "Suvarna Keralam" },
  { day: 6, name: "Karunya" },
  { day: 0, name: "Samrudhi" },
];

/** Kerala bumpers: draw month (1–12) and first prize in ₹ crore. */
export const KERALA_BUMPERS: { key: PrizeKey; month: number; crore: number }[] = [
  { key: "xmas", month: 1, crore: 20 },
  { key: "summer", month: 3, crore: 10 },
  { key: "vishu", month: 5, crore: 12 },
  { key: "monsoon", month: 7, crore: 10 },
  { key: "thiruvonam", month: 9, crore: 30 },
  { key: "pooja", month: 11, crore: 12 },
];
