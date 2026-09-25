import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
const svg = readFileSync("src/app/icon.svg");
const png = (size) => sharp(svg, { density: 512 }).resize(size, size).png().toBuffer();
writeFileSync("src/app/apple-icon.png", await png(180));
writeFileSync("public/icon-192.png", await png(192));
writeFileSync("public/icon-512.png", await png(512));
// maskable: mark on full-bleed navy with padding
const mask = await sharp({ create: { width: 512, height: 512, channels: 4, background: "#061a44" } })
  .composite([{ input: await sharp(svg, { density: 512 }).resize(400, 400).png().toBuffer(), gravity: "center" }])
  .png().toBuffer();
writeFileSync("public/icon-maskable-512.png", mask);
// favicon.ico with embedded 48px + 32px + 16px PNGs
const sizes = [16, 32, 48];
const imgs = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const dir = sizes.map((s, i) => { const e = Buffer.alloc(16); e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(imgs[i].length, 8); e.writeUInt32LE(offset, 12); offset += imgs[i].length; return e; });
writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...dir, ...imgs]));
console.log("icons written");
