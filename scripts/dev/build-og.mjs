#!/usr/bin/env node
/**
 * Render the social cards (reproducible; no network, no build step on the host).
 *
 * AUTHORING TOOL, not shipped. Uses Playwright's Chromium that already exists on the
 * authoring machine (never run `playwright install` for this):
 *
 *   PLAYWRIGHT_PATH=/path/to/node_modules/playwright node scripts/dev/build-og.mjs
 *
 * Outputs (committed):
 *   assets/social/og-home.png      1200x630  home
 *   assets/social/og-product.png   1200x630  /product/
 *   assets/social/og-docs.png      1200x630  /docs/ index
 *   assets/social/og-doc.png       1200x630  generic documentation page (room for a title line)
 *   assets/social-preview.png      1280x640  GitHub repository social preview
 *
 * Determinism: fonts are loaded from assets/fonts/*.woff2 via file:// @font-face and the
 * script waits for document.fonts.ready (and fails if a family did not load) before the
 * screenshot. Product imagery is the genuine dashboard capture (assets/img/dashboard-1600.webp),
 * unedited, shown inside a night browser frame and cropped by the card edge.
 * PNGs are colour-quantised with Pillow (python3) when above the 350 KB budget.
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const pwPath = process.env.PLAYWRIGHT_PATH || '/home/user/vulngpt/LatestVGPT-main/LatestVGPT-main/client/node_modules/playwright';
const { chromium } = createRequire(import.meta.url)(pwPath);

const url = (p) => pathToFileURL(path.join(root, p)).href;
const mark = fs.readFileSync(path.join(root, 'assets/brand/vulngpt-mark.svg'), 'utf8')
  .replace(/ width="512" height="512"/, ' width="100%" height="100%"')
  .replace(/<title>.*?<\/title>\n?/, '');
const BUDGET = 350 * 1024;

const fonts = `
@font-face{font-family:'Newsreader';font-weight:400;font-style:normal;src:url(${url('assets/fonts/newsreader-400.woff2')}) format('woff2')}
@font-face{font-family:'Newsreader';font-weight:500;font-style:normal;src:url(${url('assets/fonts/newsreader-500.woff2')}) format('woff2')}
@font-face{font-family:'Newsreader';font-weight:600;font-style:normal;src:url(${url('assets/fonts/newsreader-600.woff2')}) format('woff2')}
@font-face{font-family:'Newsreader';font-weight:400;font-style:italic;src:url(${url('assets/fonts/newsreader-400-italic.woff2')}) format('woff2')}
@font-face{font-family:'Instrument Sans';font-weight:400;src:url(${url('assets/fonts/instrument-sans-400.woff2')}) format('woff2')}
@font-face{font-family:'Instrument Sans';font-weight:500;src:url(${url('assets/fonts/instrument-sans-500.woff2')}) format('woff2')}
@font-face{font-family:'Instrument Sans';font-weight:600;src:url(${url('assets/fonts/instrument-sans-600.woff2')}) format('woff2')}
@font-face{font-family:'JetBrains Mono';font-weight:400;src:url(${url('assets/fonts/jetbrains-mono-400.woff2')}) format('woff2')}
@font-face{font-family:'JetBrains Mono';font-weight:500;src:url(${url('assets/fonts/jetbrains-mono-500.woff2')}) format('woff2')}`;

const css = (w, h) => `
${fonts}
:root{--paper:#F6F4EF;--paper-2:#EDE9E0;--ink:#0B0C10;--ink-2:#3A3D47;--ink-3:#6A6E7A;--line:rgba(11,12,16,.12);--night:#0A0B10;--night-2:#11131B;--accent:#6B46E5}
*{box-sizing:border-box;margin:0}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:var(--paper)}
body{position:relative;font-family:'Instrument Sans',sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}
.grid{position:absolute;inset:0;pointer-events:none}
.grid i{position:absolute;background:var(--line);opacity:.55}
.grid .v{top:0;bottom:0;width:1px}.grid .h{left:0;right:0;height:1px}
.top{position:absolute;left:64px;top:44px;display:flex;align-items:center;gap:12px}
.mk{width:38px;height:38px;color:var(--ink)}
.nm{font-family:'Newsreader',serif;font-weight:600;font-size:30px;letter-spacing:-.01em;line-height:1}
.by{font-size:15px;color:var(--ink-3);font-weight:500;margin-left:2px;padding-top:6px}
.tag{position:absolute;right:64px;top:50px;font:500 14px/1 'JetBrains Mono',monospace;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-2);border:1px solid var(--ink-3);padding:8px 12px;border-radius:2px;background:var(--paper);z-index:5}
.copy{position:absolute;left:64px;width:480px;top:170px}
h1{font-family:'Newsreader',serif;font-weight:600;font-size:70px;line-height:1.02;letter-spacing:-.022em}
.sub{margin-top:26px;font-size:21px;line-height:1.45;color:var(--ink-2);max-width:440px}
.foot{position:absolute;left:64px;right:64px;bottom:34px;display:flex;justify-content:space-between;font:500 15px/1 'JetBrains Mono',monospace;color:var(--ink-3);letter-spacing:.02em}
.rule{position:absolute;left:64px;right:64px;height:1px;background:var(--ink);opacity:.85}
.frame{position:absolute;left:600px;top:196px;width:900px;border-radius:12px 0 0 0;background:var(--night);box-shadow:0 18px 40px rgba(11,12,16,.22);overflow:hidden}
.bar{height:30px;display:flex;align-items:center;gap:7px;padding:0 14px;background:var(--night-2);border-bottom:1px solid rgba(255,255,255,.09)}
.bar b{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.2)}
.bar span{margin-left:12px;font:400 12px 'JetBrains Mono',monospace;color:rgba(255,255,255,.45)}
.frame img{display:block;width:900px;height:auto}
.case{position:absolute;left:620px;top:150px;width:516px;border:1px solid var(--ink);background:var(--paper)}
.case div{display:grid;grid-template-columns:150px 1fr;border-bottom:1px solid var(--line);min-height:76px}
.case div:last-child{border-bottom:0}
.case dt{padding:18px 18px;font:500 13px/1.3 'JetBrains Mono',monospace;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-3);border-right:1px solid var(--line)}
.case dd{padding:16px 18px;display:flex;flex-direction:column;gap:9px;justify-content:center}
.case dd i{display:block;height:7px;border-radius:1px;background:var(--paper-2)}
.case dd i:nth-child(1){width:92%}.case dd i:nth-child(2){width:68%}
.eyebrow{font:500 14px/1 'JetBrains Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);margin-bottom:22px}
.line2{margin-top:30px;padding-top:18px;border-top:1px solid var(--line);font:italic 400 26px/1.3 'Newsreader',serif;color:var(--ink-2);max-width:620px}
`;

const lockup = `<div class="top"><span class="mk">${mark}</span><span class="nm">VulnGPT</span><span class="by">by NovaSecLabs</span></div>`;
const AUTH = 'For applications you own or are authorized to test.';
const chrome = (extra = '', right = AUTH) => `<div class="grid"><i class="v" style="left:64px"></i><i class="v" style="left:590px"></i><i class="v" style="right:64px"></i><i class="h" style="top:104px"></i><i class="h" style="bottom:70px"></i></div>${lockup}<div class="tag">Private beta</div>${extra}<div class="foot"><span>showcase.novaseclabs.com</span><span>${right}</span></div>`;
const shot = (src) => `<div class="frame"><div class="bar"><b></b><b></b><b></b><span>VulnGPT workspace · static capture</span></div><img src="${url(src)}" alt=""></div>`;

const cards = {
  'assets/social/og-home.png': { w: 1200, h: 630, body: chrome(`<div class="copy"><h1>Find the flaws that hide in behavior.</h1></div>${shot('assets/img/dashboard-1600.webp')}`, '') },
  'assets/social/og-product.png': { w: 1200, h: 630, body: chrome(`<div class="copy"><h1>A look inside VulnGPT</h1><p class="sub">Genuine captures of the private-beta interface.</p></div>${shot('assets/img/dashboard-1600.webp')}`, '') },
  'assets/social/og-docs.png': { w: 1200, h: 630, body: chrome(`<div class="copy" style="width:500px"><h1>Documentation and evidence standards</h1></div><dl class="case"><div><dt>Hypothesis</dt><dd><i></i><i></i></dd></div><div><dt>Controlled test</dt><dd><i></i><i></i></dd></div><div><dt>Observed</dt><dd><i></i><i></i></dd></div><div><dt>Limitations</dt><dd><i></i><i></i></dd></div></dl>`) },
  'assets/social/og-doc.png': { w: 1200, h: 630, body: chrome(`<div class="copy" style="width:900px;top:176px"><div class="eyebrow">Documentation</div><h1 style="font-size:88px">VulnGPT documentation</h1><p class="line2">Evidence, scope and responsible-use notes for the private beta.</p></div>`) },
  'assets/social-preview.png': { w: 1280, h: 640, body: chrome(`<div class="copy" style="top:176px"><h1>Find the flaws that hide in behavior.</h1></div>${shot('assets/img/dashboard-1600.webp').replace('class="frame"', 'class="frame" style="left:640px;top:204px"')}`, '') },
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vg-og-'));
const browser = await chromium.launch();
for (const [out, { w, h, body }] of Object.entries(cards)) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const file = path.join(tmp, path.basename(out) + '.html');
  fs.writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${css(w, h)}</style><body>${body}</body>`);
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  // a family counts as loaded when at least one of its faces finished loading (faces load lazily, only when used)
  const ok = await page.evaluate(() => ['Newsreader', 'Instrument Sans', 'JetBrains Mono'].every((fam) => [...document.fonts].some((f) => f.family.replace(/"/g, '') === fam && f.status === 'loaded')));
  const imgsOk = await page.evaluate(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
  if (!ok || !imgsOk) throw new Error(`fonts/images not ready for ${out}`);
  const dest = path.join(root, out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await page.screenshot({ path: dest, clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
  let size = fs.statSync(dest).size;
  if (size > BUDGET) {
    execFileSync('python3', ['-c', 'import sys;from PIL import Image;p=sys.argv[1];im=Image.open(p).convert("RGB").quantize(colors=128,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE);im.save(p,optimize=True)', dest]);
    size = fs.statSync(dest).size;
  }
  console.log(out, `${w}x${h}`, `${(size / 1024).toFixed(0)} KB`);
}
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
