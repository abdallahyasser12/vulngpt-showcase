#!/usr/bin/env node
// Offline checks for vercel.json: structure, then a simulation of the redirect and header rules
// against sample hosts and paths. Dependency-free. This approximates Vercel's matching (path-to-regexp
// style sources, regex host conditions); it does not replace a preview deployment.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
let passed = 0;
const ok = (cond, msg) => { if (cond) passed += 1; else failures.push(msg); };

let cfg;
try { cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')); } catch (e) { console.error(`vercel.json does not parse: ${e.message}`); process.exit(1); }

// ---- structure ----
const ALLOWED = new Set(['$schema', 'trailingSlash', 'cleanUrls', 'redirects', 'headers']);
for (const k of Object.keys(cfg)) ok(ALLOWED.has(k), `vercel.json: unexpected top-level key "${k}"`);
ok(cfg.trailingSlash === true, 'vercel.json: trailingSlash must be true (one canonical URL per page)');
ok(cfg.cleanUrls === true, 'vercel.json: cleanUrls must be true (no duplicate .html URLs)');
for (const r of cfg.redirects || []) {
  ok(typeof r.source === 'string' && typeof r.destination === 'string' && typeof r.permanent === 'boolean', 'redirect needs source, destination and boolean permanent');
}
for (const h of cfg.headers || []) {
  ok(typeof h.source === 'string' && Array.isArray(h.headers) && h.headers.every((x) => x.key && typeof x.value === 'string'), `header rule needs source and key/value headers: ${h.source}`);
}
ok((cfg.redirects || []).length === 1, 'only the production alias host is redirected');

// ---- matching ----
function sourceToRegExp(src) {
  let out = '';
  let depth = 0;
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '(') depth += 1;
    if (depth > 0) { out += ch; if (ch === ')') depth -= 1; continue; }
    if (ch === ':') {
      const m = src.slice(i).match(/^:[A-Za-z_]\w*(\*|\+|\?)?/);
      out += m[1] === '*' ? '(.*)' : m[1] === '+' ? '(.+)' : '([^/]+)';
      i += m[0].length - 1;
      continue;
    }
    out += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${out}$`);
}
const hostOk = (has, host) => (has || []).every((c) => c.type !== 'host' || new RegExp(`^(?:${c.value})$`).test(host));

function evaluate(host, p) {
  const res = { redirect: null, headers: {}, cacheRules: [] };
  for (const r of cfg.redirects || []) {
    const m = p.match(sourceToRegExp(r.source));
    if (m && hostOk(r.has, host)) {
      res.redirect = { status: r.permanent ? 308 : 307, location: r.destination.replace(':path*', p.slice(1)) };
      return res;
    }
  }
  for (const h of cfg.headers || []) {
    if (!sourceToRegExp(h.source).test(p) || !hostOk(h.has, host)) continue;
    for (const { key, value } of h.headers) {
      res.headers[key] = value;
      if (key === 'Cache-Control') res.cacheRules.push(h.source);
    }
  }
  return res;
}

const PROD = 'showcase.novaseclabs.com';
const ALIAS = 'vulngpt-showcase.vercel.app';
const PREVIEWS = ['vulngpt-showcase-git-claude-premium-abc123-team.vercel.app', 'vulngpt-showcase-9xk2m1q.vercel.app'];

// redirect behaviour
let r = evaluate(ALIAS, '/docs/faq/');
ok(r.redirect && r.redirect.status === 308 && r.redirect.location === 'https://showcase.novaseclabs.com/docs/faq/', `alias host redirects permanently to the branded host (got ${JSON.stringify(r.redirect)})`);
r = evaluate(ALIAS, '/');
ok(r.redirect && r.redirect.location === 'https://showcase.novaseclabs.com/', 'alias root redirects to the branded root');
r = evaluate(PROD, '/docs/faq/');
ok(!r.redirect, 'branded host is not redirected');
for (const h of PREVIEWS) ok(!evaluate(h, '/').redirect, `preview host is not redirected: ${h}`);

// noindex only on preview hosts
for (const h of PREVIEWS) ok(evaluate(h, '/docs/').headers['X-Robots-Tag'] === 'noindex, nofollow', `preview host gets X-Robots-Tag noindex: ${h}`);
ok(!('X-Robots-Tag' in evaluate(PROD, '/docs/').headers), 'branded host has no X-Robots-Tag');
ok(!('X-Robots-Tag' in evaluate(ALIAS, '/docs/').headers), 'production alias never receives the noindex rule');
ok(!('X-Robots-Tag' in evaluate('evilvercel.app', '/').headers) && !('X-Robots-Tag' in evaluate('x.vercel.app.example.com', '/').headers), 'noindex rule does not match look-alike hosts');

// security headers on every path
const SECURITY = ['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options', 'Content-Security-Policy', 'Strict-Transport-Security'];
for (const p of ['/', '/docs/faq/', '/assets/img/dashboard-1600.webp', '/css/site.css', '/sitemap.xml', '/.well-known/security.txt', '/404.html']) {
  const hd = evaluate(PROD, p).headers;
  ok(SECURITY.every((k) => k in hd), `security headers present on ${p}`);
}
const csp = evaluate(PROD, '/').headers['Content-Security-Policy'];
ok(/default-src 'self'/.test(csp) && /script-src 'self'(;|$)/.test(csp) && /style-src 'self'(;|$)/.test(csp) && /frame-ancestors 'none'/.test(csp) && /object-src 'none'/.test(csp), 'CSP is strict (self only, no inline, no framing)');
ok(!/unsafe-inline|unsafe-eval|https?:\/\/(?!www\.novaseclabs\.com)/.test(csp), 'CSP allows no inline code and no third-party origin');
ok(evaluate(PROD, '/').headers['Strict-Transport-Security'] === 'max-age=31536000', 'HSTS is one year, no preload');

// cache: exactly one Cache-Control rule per path
const CACHE_CASES = [
  ['/', 'public, max-age=0, must-revalidate'],
  ['/docs/', 'public, max-age=0, must-revalidate'],
  ['/docs/faq/', 'public, max-age=0, must-revalidate'],
  ['/product/', 'public, max-age=0, must-revalidate'],
  ['/script.js', 'public, max-age=0, must-revalidate'],
  ['/docs/docs.js', 'public, max-age=0, must-revalidate'],
  ['/docs/docs.css', 'public, max-age=0, must-revalidate'],
  ['/css/site.css', 'public, max-age=0, must-revalidate'],
  ['/assets/img/dashboard-1600.webp', 'public, max-age=604800, stale-while-revalidate=86400'],
  ['/assets/brand/favicon.svg', 'public, max-age=604800, stale-while-revalidate=86400'],
  ['/assets/dashboard.png', 'public, max-age=604800, stale-while-revalidate=86400'],
  ['/assets/fonts/newsreader-500.woff2', 'public, max-age=31536000, immutable'],
  ['/sitemap.xml', undefined],
  ['/robots.txt', undefined],
];
for (const [p, expected] of CACHE_CASES) {
  const e = evaluate(PROD, p);
  ok(e.cacheRules.length === (expected ? 1 : 0), `exactly ${expected ? 'one' : 'no'} Cache-Control rule matches ${p} (matched ${e.cacheRules.length})`);
  ok(e.headers['Cache-Control'] === expected, `Cache-Control for ${p} is ${expected ?? '(platform default)'} (got ${e.headers['Cache-Control']})`);
}
ok(evaluate(PROD, '/.well-known/security.txt').headers['Content-Type'] === 'text/plain; charset=utf-8', 'security.txt is served as text/plain');
ok(fs.existsSync(path.join(ROOT, '.well-known/security.txt')), '.well-known/security.txt exists in the deployed tree');
ok(fs.existsSync(path.join(ROOT, '404.html')), '404.html exists (Vercel serves it with status 404 automatically)');

console.log(`Vercel configuration test: ${failures.length ? 'FAILED' : 'PASSED'} (${passed}/${passed + failures.length} checks)`);
for (const f of failures) console.error(`  - ${f}`);
process.exit(failures.length ? 1 : 0);
