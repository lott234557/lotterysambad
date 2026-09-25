/** IST (UTC+05:30, no DST) helpers. Dates are handled as ISO strings "YYYY-MM-DD". */

export const IST_OFFSET_MIN = 330;
export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const pad = (n: number) => String(n).padStart(2, "0");

export function nowIST(at: number = Date.now()) {
  const d = new Date(at + IST_OFFSET_MIN * 60_000);
  return {
    iso: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hours: d.getUTCHours(),
    minutes: d.getUTCMinutes(),
    seconds: d.getUTCSeconds(),
    weekday: d.getUTCDay(),
    /** minutes since IST midnight */
    minuteOfDay: d.getUTCHours() * 60 + d.getUTCMinutes(),
  };
}

export const todayIST = () => nowIST().iso;

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function isValidISO(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

/** "25-09-2026" -> "2026-09-25" (null when invalid) */
export function dmyToISO(dmy: string): string | null {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dmy);
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  return isValidISO(iso) ? iso : null;
}

const parts = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
};

/** "2026-09-25" -> "25-09-2026" (URL format) */
export const isoToDMY = (iso: string) => {
  const { y, m, d } = parts(iso);
  return `${pad(d)}-${pad(m)}-${y}`;
};
/** "25.09.2026" */
export const dotted = (iso: string) => isoToDMY(iso).replace(/-/g, ".");
/** "25.09.26" */
export const dottedShort = (iso: string) => {
  const { y, m, d } = parts(iso);
  return `${pad(d)}.${pad(m)}.${String(y).slice(2)}`;
};
/** "25/09/26" */
export const slashShort = (iso: string) => dottedShort(iso).replace(/\./g, "/");
/** "25 September 2026" */
export const longDate = (iso: string) => {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
/** "25 Sep 2026" */
export const shortDate = (iso: string) => {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS_SHORT[m - 1]} ${y}`;
};
export const weekdayOf = (iso: string) => {
  const { y, m, d } = parts(iso);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};
export const weekdayName = (iso: string) => WEEKDAYS[weekdayOf(iso)];
/** "Friday, 25 September 2026" */
export const fullDate = (iso: string) => `${weekdayName(iso)}, ${longDate(iso)}`;

export const monthKey = (iso: string) => iso.slice(0, 7); // "2026-09"
export const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
};
export function daysInMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
export function addMonths(key: string, n: number) {
  const [y, m] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}`;
}

/** Format a Date/timestamp in IST, e.g. "25 Sep 2026, 1:09 PM" */
export function formatIST(ts: Date | string | number | null | undefined): string {
  if (!ts) return "";
  const n = nowIST(new Date(ts).getTime());
  const h12 = n.hours % 12 || 12;
  return `${n.day} ${MONTHS_SHORT[n.month - 1]} ${n.year}, ${h12}:${pad(n.minutes)} ${n.hours < 12 ? "AM" : "PM"}`;
}

/** ISO timestamp with +05:30 offset for schema.org */
export function isoWithIST(ts: Date | string | number): string {
  const n = nowIST(new Date(ts).getTime());
  return `${n.iso}T${pad(n.hours)}:${pad(n.minutes)}:${pad(n.seconds)}+05:30`;
}

/** Epoch ms for an IST wall-clock time on a date */
export function istToEpoch(iso: string, hour: number, minute = 0): number {
  const { y, m, d } = parts(iso);
  return Date.UTC(y, m - 1, d, hour, minute) - IST_OFFSET_MIN * 60_000;
}
