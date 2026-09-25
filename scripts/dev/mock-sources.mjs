// Local mock of the source sites for end-to-end testing of the scraper.
// Usage: node scripts/dev/mock-sources.mjs  (port 4010) then set SCRAPER_MOCK_ORIGIN=http://localhost:4010
import http from "node:http";
import sharp from "sharp";

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
      let html = null;
      if ((m = /^\/sambad\.com\/today-(1pm|6pm|8pm)$/.exec(p))) html = todayPage(m[1]);
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
