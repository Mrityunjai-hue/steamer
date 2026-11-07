#!/usr/bin/env node
/**
 * Generate Steamer's raster brand assets from public/brand/icon.svg and logo.svg.
 * Run: npm install --save-dev sharp && node scripts/generate-brand-assets.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const pub = path.join(root, "public");
const brand = path.join(pub, "brand");
const bg = "#0B0018";
const iconSvg = await fs.readFile(path.join(brand, "icon.svg"));
const logoSvg = await fs.readFile(path.join(brand, "logo.svg"));

async function renderIcon(size, padding = 0.10, solid = false) {
  const inner = Math.round(size * (1 - padding * 2));
  const resized = await sharp(iconSvg).resize(inner, inner, { fit: "contain", kernel: "lanczos" }).png().toBuffer();
  const layers = [{ input: resized, left: Math.round((size-inner)/2), top: Math.round((size-inner)/2) }];
  return sharp({ create: { width: size, height: size, channels: 4, background: solid ? bg : { r: 11, g: 0, b: 24, alpha: 0 } } })
    .composite(layers).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
}

await fs.mkdir(pub, { recursive: true });
await fs.writeFile(path.join(pub, "favicon-32.png"), await renderIcon(32, 0.08, false));
await fs.writeFile(path.join(pub, "apple-touch-icon.png"), await renderIcon(180, 0.12, true));
await fs.writeFile(path.join(pub, "icon-192.png"), await renderIcon(192, 0.10, false));
await fs.writeFile(path.join(pub, "icon-512.png"), await renderIcon(512, 0.10, false));
await fs.writeFile(path.join(pub, "icon-512-maskable.png"), await renderIcon(512, 0.20, true));

// A standards-compliant ICO container with 16/32/48 PNG payloads.
const icoImages = await Promise.all([16,32,48].map(async size => ({
  size, data: await renderIcon(size, 0.08, false)
})));
const header = Buffer.alloc(6 + icoImages.length * 16);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(icoImages.length, 4);
let offset = header.length;
icoImages.forEach((img, i) => {
  const p = 6 + i * 16;
  header[p] = img.size === 256 ? 0 : img.size;
  header[p+1] = img.size; header[p+2] = 0; header[p+3] = 0;
  header.writeUInt16LE(1, p+4); header.writeUInt16LE(32, p+6);
  header.writeUInt32LE(img.data.length, p+8); header.writeUInt32LE(offset, p+12);
  offset += img.data.length;
});
await fs.writeFile(path.join(pub, "favicon.ico"), Buffer.concat([header, ...icoImages.map(x=>x.data)]));

// Wide OG image: symbol left, Steamer wordmark right; tagline intentionally omitted.
const logoRaster = await sharp(logoSvg).resize({ width: 400, height: 107, fit: "contain" }).png().toBuffer();
const markRaster = await sharp(iconSvg).resize(320, 320, { fit: "contain" }).png().toBuffer();
const ogSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#19072C"/><stop offset="1" stop-color="#0B0018"/></linearGradient><radialGradient id="r"><stop stop-color="#9D42D9" stop-opacity=".3"/><stop offset="1" stop-color="#0B0018" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="url(#g)"/><circle cx="300" cy="315" r="290" fill="url(#r)"/><circle cx="300" cy="315" r="250" fill="none" stroke="#B75BFA" stroke-opacity=".2" stroke-width="2"/><text x="680" y="340" font-family="Inter,Arial,sans-serif" font-size="100" font-weight="800" fill="#F6DFFF">Steamer</text></svg>`);
await sharp(ogSvg).composite([
  { input: markRaster, left: 140, top: 155 },
  { input: logoRaster, left: 660, top: 270 }
]).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(path.join(pub, "og-image.png"));

// 2x UI logo raster export (source SVG remains the sharp scalable asset).
await sharp(logoSvg).resize(720, 168, { kernel: "lanczos" }).png({ compressionLevel: 9 }).toFile(path.join(pub, "brand/logo@2x.png"));

const targets = ["favicon.ico","apple-touch-icon.png","icon-192.png","icon-512.png","icon-512-maskable.png","og-image.png","brand/logo@2x.png"];
for (const file of targets) {
 const full = path.join(pub,file);
 const meta = await sharp(full).metadata();
 const stat = await fs.stat(full);
 console.log(`${file}\t${meta.width}x${meta.height}\t${(stat.size/1024).toFixed(1)} KB`);
}
