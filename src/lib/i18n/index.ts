import en, { type Dict } from "./dict/en";
import hi from "./dict/hi";
import bn from "./dict/bn";
import ml from "./dict/ml";
import type { Locale } from "./config";
import { nowIST } from "../time";

export * from "./config";
export type { Dict };

const DICTS: Record<Locale, Dict> = { en, hi, bn, ml };

export const getDict = (lang: Locale): Dict => DICTS[lang] ?? en;

/** Replace {placeholders}. */
export function fmt(s: string, vars: Record<string, string | number | null | undefined> = {}) {
  return s.replace(/\{(\w+)\}/g, (_m, k) => (vars[k] ?? `{${k}}`).toString());
}

const pad = (n: number) => String(n).padStart(2, "0");
const parts = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d, wd: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
};

/** "25 September 2026" in the given language */
export const longDateL = (t: Dict, iso: string) => {
  const { y, m, d } = parts(iso);
  return `${d} ${t.months[m - 1]} ${y}`;
};
/** "25 Sep 2026" */
export const shortDateL = (t: Dict, iso: string) => {
  const { y, m, d } = parts(iso);
  return `${d} ${t.monthsShort[m - 1]} ${y}`;
};
export const weekdayL = (t: Dict, iso: string) => t.weekdays[parts(iso).wd];
/** "Friday, 25 September 2026" */
export const fullDateL = (t: Dict, iso: string) => `${weekdayL(t, iso)}, ${longDateL(t, iso)}`;
export const monthLabelL = (t: Dict, key: string) => {
  const [y, m] = key.split("-").map(Number);
  return `${t.months[m - 1]} ${y}`;
};
/** "25 Sep 2026, 1:09 PM" in IST */
export function formatISTL(t: Dict, ts: Date | string | number | null | undefined) {
  if (!ts) return "";
  const n = nowIST(new Date(ts).getTime());
  const h12 = n.hours % 12 || 12;
  return `${n.day} ${t.monthsShort[n.month - 1]} ${n.year}, ${h12}:${pad(n.minutes)} ${n.hours < 12 ? t.am : t.pm}`;
}
export function timeISTL(t: Dict, ts: Date | string | number | null | undefined) {
  if (!ts) return "";
  const n = nowIST(new Date(ts).getTime());
  return `${n.hours % 12 || 12}:${pad(n.minutes)} ${n.hours < 12 ? t.am : t.pm}`;
}
