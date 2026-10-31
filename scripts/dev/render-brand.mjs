#!/usr/bin/env node
/**
 * Rasterise the brand SVGs (assets/brand/*.svg) into PNG icons and favicon.ico.
 *
 * AUTHORING TOOL, not shipped. The repo stays dependency-free; this script borrows the
 * Chromium that Playwright already has installed elsewhere on the authoring machine:
 *
 *   PLAYWRIGHT_PATH=/path/to/node_modules/playwright node scripts/dev/render-brand.mjs
 *
 * (default: the LatestVGPT client checkout used when this was authored). Never run
 * `playwright install` for this; it only needs an existing chromium.
 *
 * Inputs : assets/brand/favicon.svg, vulngpt-mark-gradient.svg  (see build-brand.py)
 * Outputs: favicon-32.png, apple-touch-icon.png (180), icon-192.png, icon-512.png,
 *          icon-maskable-512.png, favicon.ico (16/32/48 PNG-in-ICO)
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const brand = path.join(root, 'assets', 'brand');
const pwPath = process.env.PLAYWRIGHT_PATH || '/home/user/vulngpt/LatestVGPT-main/LatestVGPT-main/client/node_modules/playwright';
const { chromium } = createRequire(import.meta.url)(pwPath);

const NIGHT = '#0A0B10';
const markSvg = fs.readFileSync(path.join(brand, 'vulngpt-mark-gradient.svg'), 'utf8')
  .replace(/ width="512" height="512"/, ' width="100%" height="100%"');
const favSvg = fs.readFileSync(path.join(brand, 'favicon.svg'), 'utf8')
  .replace(/ width="512" height="512"/, ' width="100%" height="100%"');

// kind: 'fav' = favicon.svg as drawn; otherwise a night tile with the full-detail gradient mark.
const jobs = [
  { out: 'favicon-32.png', size: 32, kind: 'fav' },
  { out: 'apple-touch-icon.png', size: 180, kind: 'mark', pad: 0.18, radius: 0 }, // iOS rounds the corners itself
  { out: 'icon-192.png', size: 192, kind: 'mark', pad: 0.16, radius: 0.22 },
  { out: 'icon-512.png', size: 512, kind: 'mark', pad: 0.16, radius: 0.22 },
  { out: 'icon-maskable-512.png', size: 512, kind: 'mark', pad: 0.22, radius: 0 }, // safe zone: mark well inside the 80% circle
];

function page(job) {
  const { size } = job;
  if (job.kind === 'fav') {
    return `<body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px">${favSvg}</div>`;
  }
  const inner = Math.round(size * (1 - 2 * job.pad));
  const off = Math.round((size - inner) / 2);
  return `<body style="margin:0;background:transparent"><div style="position:relative;width:${size}px;height:${size}px;background:${NIGHT};border-radius:${Math.round(size * job.radius)}px;overflow:hidden"><div style="position:absolute;left:${off}px;top:${off}px;width:${inner}px;height:${inner}px">${markSvg}</div></div>`;
}

function ico(pngs) {
  // PNG-in-ICO: 6-byte header, 16-byte entries, then image data.
  const n = pngs.length;
  const head = Buffer.alloc(6 + 16 * n);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(n, 4);
  let offset = head.length;
  pngs.forEach(({ size, buf }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, e); head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt8(0, e + 2); head.writeUInt8(0, e + 3);
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(buf.length, e + 8); head.writeUInt32LE(offset, e + 12);
    offset += buf.length;
  });
  return Buffer.concat([head, ...pngs.map((p) => p.buf)]);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vg-brand-'));
const browser = await chromium.launch();
async function shot(job) {
  const p = await browser.newPage({ viewport: { width: job.size, height: job.size }, deviceScaleFactor: 1 });
  const file = path.join(tmp, `${job.out}.html`);
  fs.writeFileSync(file, page(job));
  await p.goto('file://' + file);
  const buf = await p.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: job.size, height: job.size } });
  await p.close();
  return buf;
}

for (const job of jobs) {
  fs.writeFileSync(path.join(brand, job.out), await shot(job));
  console.log('wrote', job.out);
}
const icoSizes = [16, 32, 48];
const pngs = [];
for (const size of icoSizes) pngs.push({ size, buf: await shot({ out: `ico-${size}`, size, kind: 'fav' }) });
fs.writeFileSync(path.join(brand, 'favicon.ico'), ico(pngs));
console.log('wrote favicon.ico', icoSizes.join('/'));
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
