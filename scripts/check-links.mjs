#!/usr/bin/env node
// Static site integrity checker. Dependency-free, offline by default.
//
//   node scripts/check-links.mjs              internal links, fragments, metadata, sitemap parity, JSON-LD, hygiene
//   node scripts/check-links.mjs --external   also HEAD-check external https links (needs network)
//
// Exit code 1 when any check fails. External results of kind PENDING (pages that ship with a separate
// main-site change) and BLOCKED (bot-protected hosts that reject automated requests) never fail the run.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { repositoryRootFromScript, resolveLocalPath } from './lib/local-reference.mjs';

const ROOT = repositoryRootFromScript(import.meta.url);
const SITE = 'https://showcase.novaseclabs.com';
const EXTERNAL = process.argv.includes('--external');

// ---------- configuration ----------
const ALLOWED_EXTERNAL_IDS = new Set(['https://www.novaseclabs.com/#organization', 'https://www.novaseclabs.com/#vulngpt']);
const NOT_INDEXED = new Set(['404.html']);
const MAIN_SITE_PAGES = ['', 'about', 'pricing', 'resources', 'waitlist', 'terms', 'privacy', 'vulngpt'].map((p) => `https://www.novaseclabs.com/${p}`);
// ship with main-site PR #747; they will 404 until it is deployed
const PENDING = [/^https:\/\/www\.novaseclabs\.com\/for\/(vibe-coders|pentesters|appsec-teams|startup-founders|security-leaders)(\?|$)/];
const BOT_BLOCKED_HOSTS = new Set(['www.linkedin.com', 'x.com', 'www.producthunt.com', 'twitter.com']);
// files allowed to contain the phrase "AI-assisted" (it is quoted there as the superseded wording)
const AI_ASSISTED_ALLOWLIST = new Set(['CLAIMS.md', 'CHANGELOG.md', 'scripts/check-links.mjs', 'scripts/validate-public-repo.mjs']);

const failures = [];
const warnings = [];
let checks = 0;
const ok = (cond, msg) => { checks += 1; if (!cond) failures.push(msg); return Boolean(cond); };
const warn = (msg) => warnings.push(msg);

// ---------- file discovery ----------
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out); else out.push(full);
  }
  return out;
}
const allFiles = walk(ROOT).map((f) => path.relative(ROOT, f).split(path.sep).join('/'));
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
const urlOf = (rel) => `${SITE}/${rel.replace(/index\.html$/, '')}`;

// ---------- tiny HTML scanner ----------
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

function scan(html) {
  const jsonld = [];
  const inlineScripts = [];
  let inlineStyle = 0;
  let stripped = html.replace(/<!--[\s\S]*?-->/g, '');
  stripped = stripped.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (_m, attrs, body) => {
    if (/type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) jsonld.push(body);
    else if (!/\bsrc\s*=/.test(attrs)) inlineScripts.push(body.slice(0, 40));
    return `<script ${/\bsrc\s*=/.test(attrs) ? attrs : ''}></script>`;
  });
  stripped = stripped.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, () => { inlineStyle += 1; return ''; });
  const tags = [];
  const tagRe = /<([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g;
  for (const m of stripped.matchAll(tagRe)) {
    const attrs = {};
    for (const a of m[2].matchAll(/([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? '');
    tags.push({ name: m[1].toLowerCase(), attrs, index: m.index });
  }
  const title = stripped.match(/<title>([\s\S]*?)<\/title>/i)?.[1];
  return { tags, jsonld, inlineScripts, inlineStyle, title: title === undefined ? undefined : decode(title).trim() };
}

// ---------- URL resolution ----------
const pageInfo = new Map(); // rel path -> {ids:Set}
function idsOf(rel) {
  if (pageInfo.has(rel)) return pageInfo.get(rel);
  const info = { ids: new Set(), dupes: [] };
  if (fs.existsSync(path.join(ROOT, rel))) {
    for (const t of scan(fs.readFileSync(path.join(ROOT, rel), 'utf8')).tags) {
      if (t.attrs.id !== undefined) { if (info.ids.has(t.attrs.id)) info.dupes.push(t.attrs.id); info.ids.add(t.attrs.id); }
    }
  }
  pageInfo.set(rel, info);
  return info;
}

/** Map an internal URL path to a repository file, or return a structured resolution error. */
function toFile(urlPath) {
  const resolution = resolveLocalPath(ROOT, 'index.html', urlPath);
  if (resolution.error) return { error: resolution.error };
  if (!resolution.insideRoot) return null;

  const absolutePath = resolution.path;
  const relativePath = path.relative(ROOT, absolutePath).split(path.sep).join('/');
  if (urlPath.endsWith('/')) {
    const indexPath = path.join(absolutePath, 'index.html');
    return fs.existsSync(indexPath) ? { file: path.posix.join(relativePath, 'index.html') } : null;
  }
  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isFile()) return { file: relativePath };
  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) return { needsSlash: true };
  return null;
}

const externalLinks = new Map(); // url -> [pages]

function checkRef(page, raw, kind) {
  const value = raw.trim();
  if (!value || /^(mailto:|tel:|javascript:|data:)/i.test(value)) return;
  if (/^http:\/\//i.test(value)) { ok(false, `${page}: insecure http:// ${kind} reference: ${value}`); return; }
  let u;
  try { u = new URL(value, `${SITE}/${page.replace(/index\.html$/, '')}`); } catch { ok(false, `${page}: unparsable ${kind} URL: ${value}`); return; }
  const internal = u.origin === SITE;
  if (!internal) {
    if (u.protocol === 'https:') {
      for (const k of [...u.searchParams.keys()]) if (k.startsWith('utm_')) u.searchParams.delete(k);
      const key = u.href.split('#')[0];
      if (!externalLinks.has(key)) externalLinks.set(key, []);
      externalLinks.get(key).push(page);
    }
    return;
  }
  const target = toFile(u.pathname);
  if (target?.error) {
    ok(false, `${page}: invalid percent-encoding in ${kind} path: ${value} (${target.error})`);
    return;
  }
  if (!ok(target && target.file, `${page}: ${kind} does not resolve to a file or route: ${value}${target?.needsSlash ? ' (directory route needs a trailing slash)' : ''}`)) return;
  if (/\.html$/.test(u.pathname) && page !== '404.html') ok(false, `${page}: link to an .html URL (use the clean trailing-slash route): ${value}`);
  if (u.hash && u.hash.length > 1 && target.file.endsWith('.html')) {
    let id;
    try {
      id = decodeURIComponent(u.hash.slice(1));
    } catch (error) {
      ok(false, `${page}: invalid percent-encoding in ${kind} fragment: ${value} (${error.message})`);
      return;
    }
    ok(idsOf(target.file).ids.has(id), `${page}: fragment #${id} not found on ${target.file}`);
  }
}

// ---------- per-page checks ----------
const titles = new Map();
const descriptions = new Map();
const definedIds = new Set();
const referencedIds = [];
const pageUrls = new Set();

for (const rel of htmlFiles) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const s = scan(html);
  const meta = (key, val) => s.tags.find((t) => t.name === 'meta' && t.attrs[key] === val)?.attrs.content;
  const indexable = !NOT_INDEXED.has(rel);
  const url = urlOf(rel);
  if (indexable) pageUrls.add(url);

  ok(/^<!doctype html>/i.test(html.trimStart()), `${rel}: missing <!doctype html>`);
  ok(s.tags.find((t) => t.name === 'html')?.attrs.lang === 'en', `${rel}: <html lang="en"> missing`);
  ok(Boolean(meta('name', 'viewport')), `${rel}: viewport meta missing`);
  ok(Boolean(meta('name', 'color-scheme')), `${rel}: color-scheme meta missing`);

  // title and description
  ok(s.title && s.title.length >= 10 && s.title.length <= 60, `${rel}: title must be 10-60 chars (got ${s.title?.length}: "${s.title}")`);
  const desc = meta('name', 'description');
  if (indexable) ok(desc && desc.length >= 110 && desc.length <= 155, `${rel}: meta description must be 110-155 chars (got ${desc?.length})`);
  if (s.title) { titles.set(s.title, [...(titles.get(s.title) || []), rel]); }
  if (desc) { descriptions.set(desc, [...(descriptions.get(desc) || []), rel]); }

  // robots, canonical, social
  const robots = meta('name', 'robots') || '';
  if (indexable) {
    ok(/\bindex\b/.test(robots) && /\bfollow\b/.test(robots) && !/noindex/.test(robots), `${rel}: robots meta must be index,follow`);
    const canon = s.tags.find((t) => t.name === 'link' && t.attrs.rel === 'canonical')?.attrs.href;
    ok(canon === url, `${rel}: canonical must equal ${url} (got ${canon})`);
    ok(meta('property', 'og:url') === url, `${rel}: og:url must equal ${url}`);
    for (const k of ['og:title', 'og:description', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt', 'og:type', 'og:site_name']) ok(Boolean(meta('property', k)), `${rel}: ${k} missing`);
    for (const k of ['twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) ok(Boolean(meta('name', k)), `${rel}: ${k} missing`);
    ok(meta('name', 'twitter:card') === 'summary_large_image', `${rel}: twitter:card must be summary_large_image`);
    ok(meta('property', 'og:title') === s.title && meta('name', 'twitter:title') === s.title, `${rel}: og/twitter title should match <title>`);
    for (const k of [meta('property', 'og:image'), meta('name', 'twitter:image')]) if (k) checkRef(rel, k, 'social image');
    ok(/^https:\/\/showcase\.novaseclabs\.com\//.test(meta('property', 'og:image') || ''), `${rel}: og:image must be an absolute branded-host URL`);
  } else {
    ok(/noindex/.test(robots), `${rel}: error page should be noindex`);
  }

  // structure
  const headings = s.tags.filter((t) => /^h[1-6]$/.test(t.name)).map((t) => Number(t.name[1]));
  ok(headings.filter((h) => h === 1).length === 1, `${rel}: exactly one <h1> required (found ${headings.filter((h) => h === 1).length})`);
  let prev = 0;
  for (const h of headings) { if (prev && h > prev + 1) ok(false, `${rel}: heading level jumps from h${prev} to h${h}`); prev = h; }
  ok(s.tags.filter((t) => t.name === 'main').length === 1, `${rel}: exactly one <main> landmark required`);
  ok(s.tags.some((t) => t.name === 'a' && t.attrs.class?.includes('skip-link')), `${rel}: skip link missing`);
  const info = idsOf(rel);
  ok(info.dupes.length === 0, `${rel}: duplicate ids: ${info.dupes.join(', ')}`);

  // images
  for (const t of s.tags.filter((x) => x.name === 'img')) {
    const label = `${rel}: <img src="${t.attrs.src}">`;
    ok('alt' in t.attrs, `${label} has no alt attribute`);
    ok(t.attrs.width && t.attrs.height, `${label} needs intrinsic width and height`);
  }

  // inline code, third-party fonts
  ok(s.inlineScripts.length === 0, `${rel}: inline <script> found (CSP forbids it)`);
  ok(s.inlineStyle === 0, `${rel}: inline <style> found (CSP forbids it)`);
  ok(!s.tags.some((t) => 'style' in t.attrs), `${rel}: style="" attribute found (CSP forbids it)`);
  ok(!/fonts\.(googleapis|gstatic)\.com/.test(html), `${rel}: Google Fonts reference found`);
  ok(!s.tags.some((t) => Object.keys(t.attrs).some((k) => /^on\w+/.test(k))), `${rel}: inline event handler attribute found`);

  // aria references
  for (const t of s.tags) for (const attr of ['aria-labelledby', 'aria-controls', 'aria-describedby']) {
    if (t.attrs[attr]) for (const id of t.attrs[attr].split(/\s+/)) ok(info.ids.has(id), `${rel}: ${attr}="${id}" has no matching id`);
  }

  // references
  for (const t of s.tags) {
    if (t.name === 'a' && t.attrs.href !== undefined) checkRef(rel, t.attrs.href, 'link');
    else if (t.name === 'link' && t.attrs.href && /stylesheet|icon|manifest|preload|canonical|apple-touch-icon/.test(t.attrs.rel || '')) checkRef(rel, t.attrs.href, 'link');
    else if ((t.name === 'script' || t.name === 'img' || t.name === 'source') && t.attrs.src) checkRef(rel, t.attrs.src, 'src');
    for (const sets of [t.attrs.srcset, t.attrs.imagesrcset]) if (sets) for (const part of sets.split(',')) checkRef(rel, part.trim().split(/\s+/)[0], 'srcset');
  }

  // JSON-LD
  if (indexable) ok(s.jsonld.length >= 1, `${rel}: no JSON-LD found`);
  for (const raw of s.jsonld) {
    let data;
    try { data = JSON.parse(raw); } catch (e) { ok(false, `${rel}: JSON-LD does not parse: ${e.message}`); continue; }
    ok(data['@context'] === 'https://schema.org', `${rel}: JSON-LD @context must be https://schema.org`);
    const walkNode = (n, top) => {
      if (Array.isArray(n)) return n.forEach((x) => walkNode(x, top));
      if (!n || typeof n !== 'object') return;
      const keys = Object.keys(n);
      if (keys.length === 1 && keys[0] === '@id') referencedIds.push([rel, n['@id']]);
      else if (n['@id']) definedIds.add(n['@id']);
      if (n['@type'] === 'BreadcrumbList') n.itemListElement.forEach((it, k) => { ok(it.position === k + 1 && /^https:\/\/showcase\.novaseclabs\.com\//.test(it.item), `${rel}: breadcrumb item ${k + 1} needs position and an absolute URL`); });
      if (/Rating|Review|Offer|FAQPage|HowTo/.test(String(n['@type']))) ok(false, `${rel}: JSON-LD uses ${n['@type']}, which this site does not promise`);
      for (const v of Object.values(n)) walkNode(v, false);
    };
    walkNode(data['@graph'] || data, true);
    for (const n of data['@graph'] || []) {
      if (n['@type'] === 'TechArticle') ok(Boolean(n.dateModified && n.headline && n.author && n.publisher), `${rel}: TechArticle needs headline, dateModified, author and publisher`);
    }
  }
}

// every referenced @id exists in the site graph or is an allowed external id
for (const [rel, id] of referencedIds) ok(definedIds.has(id) || ALLOWED_EXTERNAL_IDS.has(id), `${rel}: JSON-LD references undefined @id ${id}`);

// duplicates
for (const [t, pages] of titles) ok(pages.length === 1, `duplicate <title> "${t}" on: ${pages.join(', ')}`);
for (const [d, pages] of descriptions) ok(pages.length === 1, `duplicate meta description on: ${pages.join(', ')}`);

// ---------- sitemap, robots, llms.txt, search index ----------
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
ok(new Set(locs).size === locs.length, 'sitemap.xml: duplicate <loc> entries');
for (const loc of locs) {
  const u = new URL(loc);
  ok(u.origin === SITE && !u.search && !u.hash, `sitemap.xml: ${loc} must be an absolute branded-host URL without query or fragment`);
  ok(Boolean(toFile(u.pathname)?.file), `sitemap.xml: ${loc} has no file behind it`);
  ok(!/404/.test(loc), 'sitemap.xml: the 404 page must not be listed');
}
for (const m of sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)) ok(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/.test(m[1]) && !/changefreq|priority/.test(m[1]), `sitemap.xml: entry needs a W3C-date <lastmod> and no changefreq/priority: ${m[1].slice(0, 60)}`);
for (const u of pageUrls) ok(locs.includes(u), `sitemap.xml: indexable page missing from the sitemap: ${u}`);
const robotsTxt = fs.readFileSync(path.join(ROOT, 'robots.txt'), 'utf8');
ok(robotsTxt.includes(`Sitemap: ${SITE}/sitemap.xml`), 'robots.txt: Sitemap line missing');
ok(/User-agent: \*\s+Allow: \//.test(robotsTxt), 'robots.txt: default rule must allow crawling');
for (const bot of ['OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Perplexity-User', 'Claude-SearchBot', 'Claude-User']) ok(robotsTxt.includes(`User-agent: ${bot}`), `robots.txt: ${bot} must be listed as allowed`);
ok(/(User-agent: (GPTBot|ClaudeBot|CCBot|Google-Extended)\s+){4}Disallow: \//.test(robotsTxt), 'robots.txt: GPTBot, ClaudeBot, CCBot and Google-Extended must be disallowed');

const llms = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');
ok(llms.startsWith('# VulnGPT by NovaSecLabs: product showcase\n\n> '), 'llms.txt: must start with the H1 and a blockquote summary');
for (const m of llms.matchAll(/\]\((https:\/\/showcase\.novaseclabs\.com[^)]*)\)/g)) ok(Boolean(toFile(new URL(m[1]).pathname)?.file), `llms.txt: ${m[1]} has no file behind it`);
for (const u of pageUrls) ok(llms.includes(`(${u})`) || u === `${SITE}/`, `llms.txt: ${u} is not listed`);
for (const m of llms.matchAll(/\]\((https:\/\/www\.novaseclabs\.com[^)]*)\)/g)) { if (!externalLinks.has(m[1])) externalLinks.set(m[1], ['llms.txt']); }

try {
  const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/search-index.json'), 'utf8'));
  for (const it of idx) if (!it.external) ok(Boolean(toFile(it.url)?.file), `docs/search-index.json: ${it.url} has no file behind it`);
} catch (e) { ok(false, `docs/search-index.json: ${e.message}`); }

// ---------- wording hygiene ----------
for (const rel of allFiles.filter((f) => /\.(md|html|txt|json|ya?ml|mjs|js|css|xml)$/.test(f) && !f.startsWith('assets/'))) {
  if (AI_ASSISTED_ALLOWLIST.has(rel)) continue;
  const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  ok(!/AI[- ]assisted/i.test(text), `${rel}: "AI-assisted" must not describe VulnGPT (use the approved autonomous wording)`);
}

// ---------- external ----------
async function checkExternal() {
  for (const u of MAIN_SITE_PAGES) if (!externalLinks.has(u)) externalLinks.set(u, ['(main-site list)']);
  const urls = [...externalLinks.keys()].sort();
  const results = [];
  let next = 0;
  const probe = async (url) => {
    const pending = PENDING.some((re) => re.test(url));
    const host = new URL(url).host;
    const attempt = async (method) => {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 15000);
      try { return await fetch(url, { method, redirect: 'follow', signal: ctl.signal, headers: { 'user-agent': 'vulngpt-showcase-link-check/1.0 (+https://showcase.novaseclabs.com)' } }); } finally { clearTimeout(timer); }
    };
    try {
      let res = await attempt('HEAD');
      if ([400, 403, 404, 405, 429, 501, 999].includes(res.status) && !pending) res = await attempt('GET');
      const status = res.status;
      if (status >= 200 && status < 400) return { url, kind: pending ? 'PENDING-LIVE' : 'OK', status };
      if (pending) return { url, kind: 'PENDING', status };
      if (BOT_BLOCKED_HOSTS.has(host) && [403, 429, 999].includes(status)) return { url, kind: 'BLOCKED', status };
      return { url, kind: 'FAIL', status };
    } catch (e) {
      return { url, kind: pending ? 'PENDING' : 'ERROR', status: e.cause?.code || e.name || e.message };
    }
  };
  const worker = async () => { while (next < urls.length) { const i = next; next += 1; results[i] = await probe(urls[i]); } };
  await Promise.all(Array.from({ length: 6 }, worker));
  const by = (k) => results.filter((r) => r.kind === k);
  for (const r of results) console.log(`  ${r.kind.padEnd(12)} ${String(r.status).padEnd(6)} ${r.url}`);
  const errors = by('ERROR');
  console.log(`External: ${by('OK').length} ok, ${by('PENDING').length + by('PENDING-LIVE').length} pending (main-site PR #747), ${by('BLOCKED').length} bot-blocked, ${by('FAIL').length} failed, ${errors.length} network errors (${urls.length} URLs)`);
  if (errors.length === urls.length) console.log('  Every request failed at the network level: the environment probably has no outbound access (or a proxy that must be enabled). Nothing was verified.');
  for (const r of by('FAIL')) ok(false, `external link failed (${r.status}): ${r.url} (on ${externalLinks.get(r.url).join(', ')})`);
  for (const r of errors) warn(`external link could not be checked (${r.status}): ${r.url}`);
}

if (EXTERNAL) {
  if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
    const again = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
    process.exit(again.status ?? 1);
  }
  console.log('External link check (HEAD, falling back to GET):');
  await checkExternal();
}

console.log(`Link and site integrity check: ${failures.length ? 'FAILED' : 'PASSED'} (${checks - failures.length}/${checks} checks, ${htmlFiles.length} HTML pages, ${externalLinks.size} external URLs${EXTERNAL ? ' probed' : ' found (not probed; use --external)'})`);
for (const w of warnings) console.log(`  warning: ${w}`);
for (const f of failures) console.error(`  - ${f}`);
process.exit(failures.length ? 1 : 0);
