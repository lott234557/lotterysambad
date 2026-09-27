// Local mock of the source sites for end-to-end testing of the scraper.
// Usage: node scripts/dev/mock-sources.mjs  (port 4010) then set SCRAPER_MOCK_ORIGIN=http://localhost:4010
import http from "node:http";
import sharp from "sharp";
import { readFileSync } from "node:fs";

const PORT = Number(process.env.PORT || 4010);
const WEEK = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const NAMES = {
  "1pm": ["WISH", "RISE", "SHINE", "SPARK", "STAR", "VICTORY", "VISION"],
  "6pm": ["EMPIRE", "LEGEND", "PRESTIGE", "REGAL", "SUPREME", "CROWN", "ELITE"],
  "8pm": ["MAGIC", "CLOVER", "DESTINY", "DREAM", "FAME", "HORIZON", "LUCKY"],
};
const HOUR = { "1pm": 13, "6pm": 18, "8pm": 20 };

function rng(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
}
const pad = (n, l) => String(n).padStart(l, "0");
function draw(dmy, slot) {
  const r = rng(dmy + slot);
  const set = (n, digits) => {
    const s = new Set();
    while (s.size < n) s.add(pad(Math.floor(r() * 10 ** digits), digits));
    return [...s].sort();
  };
  const first = `${10 + Math.floor(r() * 90)}${"ABCDEFGHJKL"[Math.floor(r() * 11)]} ${pad(Math.floor(r() * 1e5), 5)}`;
  const [d, m, y] = dmy.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { first, cons: first.split(" ")[1], second: set(10, 5), third: set(10, 4), fourth: set(10, 4), fifth: set(100, 4), name: `DEAR ${NAMES[slot][wd]} ${WEEK[wd]}`, wd };
}
const istNow = () => new Date(Date.now() + 330 * 60000);
const todayDMY = () => {
  const t = istNow();
  return `${pad(t.getUTCDate(), 2)}-${pad(t.getUTCMonth() + 1, 2)}-${t.getUTCFullYear()}`;
};
const published = (dmy, slot) => {
  if (process.env.MOCK_ALL === "1") return true;
  if (dmy !== todayDMY()) return true;
  const t = istNow();
  return t.getUTCHours() * 60 + t.getUTCMinutes() >= HOUR[slot] * 60 + 8;
};

const table = (x, slot) => `<h2><em>Dear Lottery ${slot.replace("pm", "")}:00 p.m.</em></h2>
<table><tr><th>Prize</th><th>Ticket Numbers</th></tr>
<tr><td><img src="/assets2/img/star.svg"> 1st Prize</td><td>${x.first}</td></tr>
<tr><td>Consolation Prize</td><td>${x.cons}</td></tr>
<tr><td>2nd Prize</td><td>${x.second.join(", ")}</td></tr>
<tr><td>3rd Prize</td><td>${x.third.join(", ")}</td></tr>
<tr><td>4th Prize</td><td>${x.fourth.join(", ")}</td></tr>
<tr><td>5th Prize</td><td>${x.fifth.join(", ")}</td></tr></table>`;

function todayPage(slot) {
  const dmy = todayDMY();
  const [d, m, y] = dmy.split("-");
  if (!published(dmy, slot)) {
    // not yet published: shows yesterday's image + waiting text
    return `<html><body><nav>1 PM 6 PM 8 PM</nav><h1>${slot.toUpperCase()} Dear Lottery Result Today (${d}/${m}/${y.slice(2)})</h1><p>Waiting 00:05:00</p>
    <img src="https://sambad.com/images/lottery-sambad-${slot}-01-01-2020.webp"></body></html>`;
  }
  const x = draw(dmy, slot);
  return `<html><body><nav><a>1 PM</a><a>6 PM</a><a>8 PM</a></nav><h1>${slot.toUpperCase()} Dear Lottery Result Today — ${x.first}</h1>
  <p>Result for <b>${d}.${m}.${y}</b></p><h2>${x.name}</h2><div>${d}/${m}/${y.slice(2)}<img src="https://sambad.com/images/lottery-sambad-${slot}-${dmy}.webp"></div>
  <p>1PM: 22 wins — 5th Prize ₹120 — 19 times</p>${table(x, slot)}</body></html>`;
}
function datePage(dmy) {
  const [d, m, y] = dmy.split("-");
  let html = `<html><body><h1>Lottery Sambad Result ${d}.${m}.${y}</h1>`;
  for (const slot of ["1pm", "6pm", "8pm"]) {
    if (!published(dmy, slot)) continue;
    const x = draw(dmy, slot);
    html += `<section><h2>Lottery Sambad ${d}.${m}.${y.slice(2)} - ${slot.toUpperCase()}</h2><img src="https://sambad.com/images/lottery-sambad-${slot}-${dmy}.webp"><h3>${x.name}</h3>${table(x, slot)}</section>`;
  }
  return html + "</body></html>";
}
function lsPage(slot) {
  const dmy = todayDMY();
  if (!published(dmy, slot)) return `<html><body><h1>Result ${slot}</h1><div>Waiting</div></body></html>`;
  const x = draw(dmy, slot);
  const [d, m, y] = dmy.split("-");
  return `<html><body><nav>1 PM Result 6 PM Result 8 PM Result</nav><h1>Lottery Sambad Result Today ${slot}</h1><div>${d}/${m}/${y.slice(2)}</div><div class="num">${x.first}</div>
  <p>Draw No. 47 · ${x.name}</p><img src="/images/lottery-sambad-${slot}-${dmy}.jpg"><a href="/pdf/lottery-sambad-${slot}-${dmy}.pdf">PDF</a></body></html>`;
}
async function sheet(slot, dmy, fmt) {
  const x = draw(dmy, slot);
  const W = 1000;
  const rows = [];
  let yy = 330;
  const line = (t, size = 26, weight = 700, fill = "#111") => { rows.push(`<text x="${W / 2}" y="${yy}" font-family="DejaVu Sans" font-size="${size}" font-weight="${weight}" text-anchor="middle" fill="${fill}">${t}</text>`); yy += size + 18; };
  line(`2nd Prize ₹9000/-   ${x.second.join("  ")}`, 20);
  line(`3rd Prize ₹500/-   ${x.third.join("  ")}`, 20);
  line(`4th Prize ₹250/-   ${x.fourth.join("  ")}`, 20);
  for (let i = 0; i < 100; i += 10) line(x.fifth.slice(i, i + 10).join("   "), 22, 600);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${yy + 60}"><rect width="100%" height="100%" fill="#fffdf2"/>
  <rect x="0" y="0" width="${W}" height="120" fill="#b3001b"/><text x="${W / 2}" y="78" font-family="DejaVu Sans" font-size="46" font-weight="800" fill="#fff" text-anchor="middle">NAGALAND STATE LOTTERIES (MOCK)</text>
  <text x="${W / 2}" y="180" font-family="DejaVu Sans" font-size="34" font-weight="800" text-anchor="middle" fill="#0b3d91">${x.name} · ${dmy} · ${slot.toUpperCase()}</text>
  <text x="${W / 2}" y="260" font-family="DejaVu Sans" font-size="50" font-weight="800" text-anchor="middle" fill="#b3001b">1st Prize ₹1 Crore  ${x.first}</text>
  ${rows.join("")}</svg>`;
  const img = sharp(Buffer.from(svg));
  return fmt === "jpg" ? img.jpeg({ quality: 85 }).toBuffer() : img.webp({ quality: 85 }).toBuffer();
}


/* ---------- other state lotteries (Kerala / Maharashtra / Punjab) ---------- */
const FX = (n) => readFileSync(new URL(`../fixtures/others/${n}`, import.meta.url), "utf8");
const MONTHS_L = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const KERALA = [["Samrudhi", "SM"], ["Bhagyathara", "BT"], ["Sthree Sakthi", "SS"], ["Dhanalekshmi", "DL"], ["Karunya Plus", "KN"], ["Suvarna Keralam", "SK"], ["Karunya", "KR"]];
const PUNJAB = ["Ranger Sunday", "Beast Monday", "Bronco Tuesday", "Buster Wednesday", "Chief Thursday", "Colt Friday", "Jackal Saturday"];
const isoOf = (dmy) => dmy.split("-").reverse().join("-");
const dmyOf = (iso) => iso.split("-").reverse().join("-");
const istMin = () => { const t = istNow(); return t.getUTCHours() * 60 + t.getUTCMinutes(); };
const out = (dmy, minute) => process.env.MOCK_ALL === "1" || dmy !== todayDMY() || istMin() >= minute;
function lastDays(n) {
  const t = istNow();
  return Array.from({ length: n }, (_, i) => { const d = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() - i)); return `${pad(d.getUTCDate(), 2)}-${pad(d.getUTCMonth() + 1, 2)}-${d.getUTCFullYear()}`; });
}
const wdOf = (dmy) => { const [d, m, y] = dmy.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
function datesIn(html, dmy) {
  const [d, m, y] = dmy.split("-");
  const mon = MONTHS_L[Number(m) - 1];
  return html
    .replace(/25-09-2026/g, dmy).replace(/25\/09\/2026/g, `${d}/${m}/${y}`)
    .replace(/September 25, 2026/g, `${mon} ${Number(d)}, ${y}`).replace(/25 Sep 2026/g, `${Number(d)} ${mon.slice(0, 3)} ${y}`)
    .replace(/26 September 2026/g, `${Number(d)} ${mon} ${y}`).replace(/26-09-2026/g, dmy);
}
function keralaMeta(dmy) {
  const [name, code] = KERALA[wdOf(dmy)];
  const [d, m, y] = dmy.split("-").map(Number);
  const no = 60 + Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(2026, 0, 1)) / (7 * 864e5));
  return { name, code: `${code}-${no}`, slug: name.toLowerCase().replace(/ /g, "-") };
}
const keralaUrl = (dmy) => { const k = keralaMeta(dmy); const [d, m, y] = dmy.split("-"); return `https://www.keralalotteries.net/${y}/${m}/${k.slug}-kerala-lottery-result-${k.code.toLowerCase()}-today-${dmy}.html`; };
function keralaPost(dmy) {
  const k = keralaMeta(dmy);
  const r = rng("kerala" + dmy);
  const first = pad(Math.floor(r() * 1e6), 6);
  return datesIn(FX("kerala-sk71.html"), dmy).replace(/Suvarna Keralam|SUVARNA KERALAM/g, k.name).replace(/SK-71/g, k.code).replace(/494226/g, first);
}
function keralaIndex(dates) {
  return `<html><body><h1>Kerala Lottery Results</h1>${dates.filter((x) => out(x, 15 * 60 + 8)).map((x) => `<div class="post-outer"><h2><a href="${keralaUrl(x)}">${keralaMeta(x).name} ${keralaMeta(x).code} Kerala Lottery Result ${x}</a></h2></div>`).join("")}</body></html>`;
}
function mahaPage(iso) {
  const dmy = dmyOf(iso);
  if (!out(dmy, 16 * 60 + 25)) return `<html><body><h1>Maharashtra Weekly Lottery Results</h1><p>Results for ${dmy} will be available soon.</p></body></html>`;
  const r = rng("maha" + dmy);
  return datesIn(FX("maharashtra-weekly-2026-09-25.html"), dmy).replace(/6375/g, pad(Math.floor(r() * 1e4), 4));
}
function punjabGr(iso) {
  const dmy = dmyOf(iso);
  if (!out(dmy, 18 * 60 + 40)) return `<html><body><h1>Punjab Weekly Lottery Results</h1><p>Draw pending.</p></body></html>`;
  const r = rng("pb" + dmy);
  return datesIn(FX("punjab-gr-weekly-2026-09-26.html"), dmy).replace(/Jackal Saturday/g, PUNJAB[wdOf(dmy)]).replace(/B 11949/g, `${"ABCDE"[Math.floor(r() * 5)]} ${pad(Math.floor(r() * 1e5), 5)}`);
}
const pbSlug = (dmy) => `punjab-state-dear-50-${PUNJAB[wdOf(dmy)].toLowerCase().replace(/ /g, "-")}-weekly-lottery-result-630pm-${dmy}-declared`;
function punjabNewsHome() {
  const links = lastDays(4).filter((x) => out(x, 18 * 60 + 45)).map((x) => `<article><h2><a href="https://www.punjablotterynews.com/${pbSlug(x)}/">Punjab State Dear 50 ${PUNJAB[wdOf(x)]} Weekly Lottery Result 6:30pm ${x} Declared</a></h2></article>`);
  return `<html><body><h1>Punjab Lottery News</h1>${links.join("")}</body></html>`;
}
function punjabNewsPost(dmy) {
  return FX("punjab-news-post.html").replace(/26-09-2026/g, dmy).replace(/Jackal Saturday/g, PUNJAB[wdOf(dmy)]).replace(/IMG-20260926-WA0026/g, `IMG-${isoOf(dmy).replace(/-/g, "")}-WA0026`);
}
async function punjabSheet(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1500"><rect width="100%" height="100%" fill="#fff"/><rect width="100%" height="140" fill="#0a5c2e"/><text x="540" y="92" font-family="DejaVu Sans" font-size="52" font-weight="800" fill="#fff" text-anchor="middle">PUNJAB STATE LOTTERIES (MOCK)</text><text x="540" y="260" font-family="DejaVu Sans" font-size="40" text-anchor="middle">${label}</text>${Array.from({ length: 40 }, (_, i) => `<text x="80" y="${340 + i * 28}" font-family="DejaVu Sans" font-size="22">${Array.from({ length: 12 }, (_, j) => pad((i * 97 + j * 131) % 10000, 4)).join("   ")}</text>`).join("")}</svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer();
}
async function otherRoute(p, q) {
  let m;
  if (p === "/keralalotteries.net/" || p === "/keralalotteries.net") return keralaIndex(lastDays(6));
  if ((m = /^\/keralalotteries\.net\/(\d{4})\/(\d{2})\/?$/.exec(p))) return keralaIndex(lastDays(40).filter((x) => x.endsWith(`-${m[2]}-${m[1]}`)));
  if ((m = /^\/keralalotteries\.net\/\d{4}\/\d{2}\/.*-(\d{2}-\d{2}-\d{4})\.html$/.exec(p))) return out(m[1], 15 * 60 + 8) ? keralaPost(m[1]) : null;
  if (p.startsWith("/keralalotteryresult.net")) return `<html><body><h1>Kerala lottery</h1><p>Live soon</p></body></html>`;
  if (p === "/goodreturns.in/maharashtra-weekly-lottery-results.html" && q.get("dt")) return mahaPage(q.get("dt"));
  if (/^\/goodreturns\.in\/maharashtra-(monthly|bumper)-lottery-results\.html$/.test(p)) return `<html><body><h1>Maharashtra Monthly Lottery Results</h1><p>Next draw on 13 October 2026.</p></body></html>`;
  if (p === "/goodreturns.in/punjab-weekly-lottery-results.html" && q.get("dt")) return punjabGr(q.get("dt"));
  if (/^\/goodreturns\.in\/punjab-(monthly|bumper)-lottery-results\.html$/.test(p)) return `<html><body><h1>Punjab Monthly Lottery Results</h1><p>No draw.</p></body></html>`;
  if (p === "/punjablotterynews.com/" || p === "/punjablotterynews.com") return punjabNewsHome();
  if ((m = /^\/punjablotterynews\.com\/punjab-state-.*-(\d{2}-\d{2}-\d{4})-declared\/?$/.exec(p))) return punjabNewsPost(m[1]);
  if (p.startsWith("/punjabstatelotteryresult.com")) return `<html><body><h1>Punjab State Lottery Result</h1></body></html>`;
  return null;
}

http
  .createServer(async (req, res) => {
    const u = new URL(req.url, "http://x");
    const p = u.pathname;
    let m;
    try {
      if ((m = /lottery-sambad-(1pm|6pm|8pm)-(\d{2}-\d{2}-\d{4})\.(jpg|webp)$/.exec(p))) {
        if (!published(m[2], m[1])) { res.writeHead(404); return res.end(); }
        const buf = await sheet(m[1], m[2], m[3]);
        res.writeHead(200, { "Content-Type": m[3] === "jpg" ? "image/jpeg" : "image/webp" });
        return res.end(buf);
      }
      if ((m = /^\/punjablotterynews\.com\/wp-content\/uploads\/.*\/(IMG-[\w-]+)\.jpg$/.exec(p))) {
        const buf = await punjabSheet(m[1]);
        res.writeHead(200, { "Content-Type": "image/jpeg" });
        return res.end(buf);
      }
      let html = await otherRoute(p, u.searchParams);
      if (html) {
        /* other lottery page */
      } else if ((m = /^\/sambad\.com\/today-(1pm|6pm|8pm)$/.exec(p))) html = todayPage(m[1]);
      else if ((m = /^\/sambad\.com\/(\d{2}-\d{2}-\d{4})$/.exec(p))) html = datePage(m[1]);
      else if ((m = /^\/lottery\.sambad\.com\/today\/(1|6|8)-pm\/?$/.exec(p))) html = lsPage(`${m[1]}pm`);
      if (html) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        return res.end(html);
      }
      res.writeHead(404);
      res.end("not found");
    } catch (e) {
      res.writeHead(500);
      res.end(String(e));
    }
  })
  .listen(PORT, () => console.log(`mock sources on http://localhost:${PORT}`));
