#!/usr/bin/env node
// Builds the documentation site from docs/*.md. Dependency-free (Node built-ins only).
//
//   node scripts/build-docs.mjs           write generated files
//   node scripts/build-docs.mjs --check   exit 1 if committed files differ from generated output
//
// Generated (and committed): docs/index.html, docs/<slug>/index.html, docs/search-index.json,
// sitemap.xml, llms.txt. Source of truth: docs/*.md, docs/README.md (hub intro), CLAIMS.md (approved wording),
// and the header/footer chrome of index.html (so every page keeps identical navigation).

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { esc, plain, slugify, renderBlocks, inline } from './lib/markdown.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://showcase.novaseclabs.com';
const MAIN = 'https://www.novaseclabs.com';
const GH = 'https://github.com/abdallahyasser12/vulngpt-showcase/blob/main/';
const ORG_ID = `${MAIN}/#organization`;
const PRODUCT_ID = `${MAIN}/#vulngpt`;
const WEBSITE_ID = `${SITE}/#website`;
const CHECK = process.argv.includes('--check');

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

// ---------- curated configuration ----------

const CATS = [
  { id: 'product', name: 'Product & technical', blurb: 'What VulnGPT is designed to investigate, how the testing model works, and how a conclusion is supported.' },
  { id: 'practitioner', name: 'Practitioner resources', blurb: 'Controlled test patterns, evaluation scenarios and a reporting structure for authorized assessments.' },
  { id: 'enterprise', name: 'Enterprise evaluation', blurb: 'Diligence material for security, privacy, procurement and architecture reviewers.' },
  { id: 'governance', name: 'Governance & reference', blurb: 'Responsible-use rules, publication gates, claim controls and repository process.' },
];

// order within a category is the reading order used for previous/next
const DOCS = [
  { file: 'PRODUCT_OVERVIEW', cat: 'product', short: 'Product overview', blurb: 'What VulnGPT is being built to investigate, who it serves, and where its boundaries are.',
    desc: 'What VulnGPT by NovaSecLabs is designed to investigate, who it is for, the principles behind it, and what it is not. Private beta.',
    related: ['technical-approach', 'evidence-and-validation', 'faq', 'enterprise-evaluation'] },
  { file: 'TECHNICAL_APPROACH', cat: 'product', short: 'Technical approach', blurb: 'A conceptual model for investigating behavior across identity, authorization, and application state.',
    desc: 'A conceptual model for testing application behavior in context: scope, baseline, invariant, hypothesis, controlled test and a reviewable result.',
    related: ['system-overview', 'evidence-and-validation', 'security-testing-playbook', 'glossary'] },
  { file: 'SYSTEM_OVERVIEW', cat: 'product', short: 'System overview', blurb: 'Public conceptual architecture, trust boundaries, and the separation between test context and evidence review.',
    desc: 'A conceptual view of the VulnGPT by NovaSecLabs investigation flow and trust boundaries. Not a deployed architecture or a component inventory.',
    related: ['technical-approach', 'security-model', 'evidence-and-validation', 'security-and-privacy'] },
  { file: 'EVIDENCE_AND_VALIDATION', cat: 'product', short: 'Evidence and validation', blurb: 'How to distinguish a suspicious signal from a supported, reviewable security conclusion.',
    desc: 'How VulnGPT by NovaSecLabs treats a suspicious signal: hypothesis, control comparison, alternative explanations, confirmation and retest.',
    related: ['technical-approach', 'finding-report-standard', 'evaluation-protocol', 'security-testing-playbook'] },
  { file: 'GLOSSARY', cat: 'product', short: 'Security glossary', blurb: 'Shared definitions for application-security, evidence, authorization, and workflow terminology.',
    desc: 'Plain definitions of BOLA, IDOR, actor, invariant, tenant isolation, WAF and other terms used across the VulnGPT documentation.',
    related: ['technical-approach', 'use-cases', 'security-testing-playbook', 'evidence-and-validation'] },
  { file: 'FAQ', cat: 'product', short: 'FAQ', blurb: 'Product status, access, intended use, supported claims, and common evaluation questions.',
    desc: 'Answers about VulnGPT by NovaSecLabs: what it is, what autonomous means, private-beta access, benchmark status, certification and authorized testing.',
    related: ['product-overview', 'responsible-testing', 'security-and-privacy', 'benchmark-governance'] },

  { file: 'SECURITY_TESTING_PLAYBOOK', cat: 'practitioner', short: 'Security testing playbook', blurb: 'Controlled patterns for object ownership, roles, multi-step workflows, sessions, and ambiguous results.',
    desc: 'A practitioner playbook for controlled, authorized tests of identity, ownership, role, workflow and session behavior in web applications.',
    related: ['use-cases', 'evidence-and-validation', 'finding-report-standard', 'assessment-plan-template'] },
  { file: 'USE_CASES', cat: 'practitioner', short: 'Use cases', blurb: 'Representative application behaviors that motivate contextual security testing.',
    desc: 'Representative application behaviors that motivate contextual testing: ownership, roles, tenants, workflows and session state. Illustrative only.',
    related: ['security-testing-playbook', 'technical-approach', 'capability-evaluation-matrix', 'glossary'] },
  { file: 'CAPABILITY_EVALUATION_MATRIX', cat: 'practitioner', short: 'Capability evaluation matrix', blurb: 'Scenario dimensions, required context, evidence expectations, and common false conclusions.',
    desc: 'Scenario dimensions, required context and evidence criteria for evaluating VulnGPT by NovaSecLabs. Not a support or coverage guarantee.',
    related: ['evaluation-protocol', 'security-testing-playbook', 'enterprise-evaluation', 'benchmark-governance'] },
  { file: 'EVALUATION_PROTOCOL', cat: 'practitioner', short: 'Evaluation protocol', blurb: 'Define ground truth and outcomes before a run; separate execution, observability, correctness, and evidence quality.',
    desc: 'A protocol for a fair, reproducible evaluation of an application-security testing product: pre-registered scenarios, ground truth and outcome classes.',
    titleTag: 'Controlled Evaluation Protocol',
    related: ['capability-evaluation-matrix', 'benchmark-governance', 'evidence-and-validation', 'enterprise-evaluation'] },
  { file: 'FINDING_REPORT_STANDARD', cat: 'practitioner', short: 'Finding report standard', blurb: 'Structure a finding around the expected boundary, evidence, impact, uncertainty, and retest.',
    desc: 'An evidence-led structure for security findings: expected boundary, test context, observation, impact, limits, remediation and retest.',
    related: ['evidence-and-validation', 'security-testing-playbook', 'assessment-plan-template', 'glossary'] },

  { file: 'ENTERPRISE_EVALUATION', cat: 'enterprise', short: 'Enterprise evaluation', blurb: 'A structured diligence guide for security, architecture, procurement, privacy, and product stakeholders.',
    desc: 'A diligence guide for security, IT, procurement and privacy reviewers evaluating VulnGPT by NovaSecLabs during private beta.',
    related: ['security-and-privacy', 'security-model', 'evaluation-protocol', 'assessment-plan-template'] },
  { file: 'SECURITY_AND_PRIVACY', cat: 'enterprise', short: 'Security and privacy', blurb: 'Public trust boundaries and the specific questions that require current vendor confirmation.',
    desc: 'Public security and privacy notes for VulnGPT by NovaSecLabs, and the questions to confirm directly before using sensitive systems or data.',
    related: ['enterprise-evaluation', 'security-model', 'responsible-testing', 'faq'] },
  { file: 'SECURITY_MODEL', cat: 'enterprise', short: 'Security model', blurb: 'Conceptual actors, data assets, trust boundaries, and threat scenarios for evaluation.',
    desc: 'A conceptual security model for evaluating VulnGPT by NovaSecLabs: actors, assets, trust boundaries, threat scenarios and assurance limits.',
    related: ['security-and-privacy', 'system-overview', 'enterprise-evaluation', 'responsible-testing'] },
  { file: 'ASSESSMENT_PLAN_TEMPLATE', cat: 'enterprise', short: 'Assessment plan template', blurb: 'Define scope, identities, operational constraints, data handling, approvals, and success criteria.',
    desc: 'A reusable worksheet for scoping an authorized assessment: targets, identities, constraints, data handling, approvals and stop conditions.',
    titleTag: 'Assessment Plan Template',
    related: ['responsible-testing', 'finding-report-standard', 'security-testing-playbook', 'enterprise-evaluation'] },

  { file: 'RESPONSIBLE_TESTING', cat: 'governance', short: 'Responsible testing', blurb: 'Authorization, scope, data minimization, safe execution, and coordinated disclosure guidance.',
    desc: 'Authorization, scope, test data and operational safeguards for using VulnGPT by NovaSecLabs only on applications you own or may test.',
    related: ['assessment-plan-template', 'security-and-privacy', 'faq', 'product-overview'] },
  { file: 'BENCHMARK_GOVERNANCE', cat: 'governance', short: 'Benchmark governance', blurb: 'Reproducibility, denominator integrity, independent review, and benchmark publication gates.',
    desc: 'The governance gates for publishing any VulnGPT benchmark: reproducibility, denominator integrity, independent review and approved wording.',
    related: ['evaluation-protocol', 'capability-evaluation-matrix', 'evidence-and-validation', 'faq'] },
  { file: 'RELEASE_PROCESS', cat: 'governance', short: 'Release process', blurb: 'Review, verification, publication, and correction procedures for the public showcase.',
    desc: 'How the public VulnGPT showcase repository is reviewed, verified, published and corrected. Applies to this website and documentation only.',
    related: ['repository-maintenance', 'benchmark-governance', 'responsible-testing'] },
  { file: 'REPOSITORY_MAINTENANCE', cat: 'governance', short: 'Repository maintenance', blurb: 'Local validation, asset hygiene, public-content review, and repository ownership.',
    desc: 'Validation, content review and asset hygiene for the public VulnGPT showcase repository. Maintainer guidance for contributors and reviewers.',
    related: ['release-process', 'benchmark-governance', 'faq'] },
];

// repository files that are part of the library but are not rendered as site pages
const EXTERNAL_REFS = [
  { title: 'Claims and messaging', path: 'CLAIMS.md', cat: 'governance', blurb: 'Approved product language and guardrails for performance, security, and assurance statements.' },
  { title: 'Public evaluation schemas', path: 'schemas/README.md', cat: 'governance', blurb: 'Optional JSON formats for externally documenting findings and benchmark reports. Not VulnGPT API contracts.' },
];

const HUB = {
  title: 'VulnGPT Docs: Evidence and Evaluation | NovaSecLabs',
  desc: 'Documentation for VulnGPT by NovaSecLabs: product overview, technical approach, evidence standard, enterprise evaluation and practitioner resources.',
  h1: 'VulnGPT documentation',
  lede: 'Product context, testing method, evidence standards and enterprise evaluation material for VulnGPT by NovaSecLabs, written for private-beta evaluators, practitioners and reviewers.',
  imageAlt: 'VulnGPT by NovaSecLabs documentation and evidence standards',
};
const DOC_IMAGE_ALT = 'VulnGPT documentation: evidence, scope and responsible-use notes for the private beta';

// ---------- git dates ----------

const TODAY = new Date().toISOString().slice(0, 10);
const dateCache = new Map();
function gitDate(rel) {
  if (dateCache.has(rel)) return dateCache.get(rel);
  let date = TODAY;
  try {
    const dirty = execFileSync('git', ['status', '--porcelain', '--', rel], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (!dirty) {
      const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', rel], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      if (iso) date = iso.slice(0, 10);
    }
  } catch { /* not a git checkout: fall back to today */ }
  dateCache.set(rel, date);
  return date;
}
const longDate = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

// ---------- source model ----------

const slugOf = (file) => file.toLowerCase().replace(/_/g, '-');
const slugs = new Map(DOCS.map((d) => [`docs/${d.file}.md`, slugOf(d.file)]));
const errors = [];
const notes = [];

function loadDoc(d) {
  const rel = `docs/${d.file}.md`;
  const src = read(rel).replace(/\r\n?/g, '\n');
  const headings = [];
  const used = new Set();
  let title = null;
  let lastHeading = '';
  const ctx = {
    notes,
    mapUrl: (url, kind) => mapUrl(url, rel, kind),
    tableLabel: () => (lastHeading ? `Table: ${lastHeading}` : 'Table'),
    heading: (level, text) => {
      const txt = plain(text);
      if (level === 1) { if (!title) title = txt; lastHeading = txt; return ""; }
      let id = slugify(text);
      let n = 2;
      const base = id;
      while (used.has(id)) { id = `${base}-${n}`; n += 1; }
      used.add(id);
      lastHeading = txt;
      headings.push({ level, id, text: txt });
      return `<h${level} id="${id}">${inlineHeading(text, ctx)}<a class="anchor" href="#${id}" aria-label="Link to this section: ${esc(txt)}">#</a></h${level}>`;
    },
  };
  const html = renderBlocks(src, ctx);
  if (!title) errors.push(`${rel}: no H1`);
  const words = src.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  const cleanTitle = title.replace(/^VulnGPT\s*[—–-]\s*/, '');
  const full = `${cleanTitle} | VulnGPT Docs`;
  const slug = slugOf(d.file);
  return {
    ...d, rel, slug, url: `${SITE}/docs/${slug}/`, path: `/docs/${slug}/`, h1: cleanTitle,
    titleTag: full.length <= 60 && !d.titleTag ? full : `${d.titleTag || d.short} | VulnGPT Docs`,
    html, headings, words, minutes: Math.max(1, Math.ceil(words / 220)),
    date: gitDate(rel), source: `${GH}${rel}`,
  };
}

function inlineHeading(text, ctx) { return inline(text, ctx); }

function mapUrl(url, fromRel, kind) {
  if (/^(https?:|mailto:|tel:)/i.test(url) || url.startsWith('#')) return url;
  const [p, frag] = url.split('#');
  const hash = frag ? `#${frag}` : '';
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), decodeURI(p || '.')));
  if (kind !== 'img') {
    if (resolved === 'docs/README.md' || resolved === 'docs/index.html' || resolved === 'docs') return `/docs/${hash}`;
    if (slugs.has(resolved)) return `/docs/${slugs.get(resolved)}/${hash}`;
    if (resolved === 'index.html' || resolved === '.') return `/${hash}`;
    if (resolved === 'product/index.html') return `/product/${hash}`;
  }
  if (!fs.existsSync(path.join(ROOT, resolved))) errors.push(`${fromRel}: link target does not exist: ${url}`);
  return kind === 'img' ? `/${encodeURI(resolved)}` : `${GH}${encodeURI(resolved)}${hash}`;
}

// ---------- shared chrome (copied from the home page so every page matches) ----------

function chrome() {
  const home = read('index.html');
  const header = home.match(/<header class="site-header">[\s\S]*?<\/header>/)?.[0];
  const footer = home.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)?.[0];
  if (!header || !footer) throw new Error('index.html: header/footer chrome not found');
  const nav = header.replace('<a href="/docs/">Docs</a>', '<a href="/docs/" aria-current="page">Docs</a>');
  if (nav === header) throw new Error('index.html: Docs nav link not found');
  const pretty = (h) => h.replace(/></g, '>\n<');
  return { header: pretty(nav), footer: pretty(footer) };
}

const utm = (content) => `${MAIN}/waitlist?utm_source=showcase&amp;utm_medium=referral&amp;utm_campaign=showcase_docs&amp;utm_content=${content}`;

function head({ title, desc, url, image, imageAlt, ogType, ld }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="VulnGPT by NovaSecLabs">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${esc(imageAlt)}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f6f4ef" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0d0e13" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/assets/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/assets/brand/favicon.ico" sizes="48x48">
<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/newsreader-500.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/instrument-sans-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/fonts.css">
<link rel="stylesheet" href="/css/site.css">
<link rel="stylesheet" href="/docs/docs.css">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': ld })}</script>
<script src="/script.js" defer></script>
<script src="/docs/docs.js" defer></script>
</head>
`;
}

const websiteNode = () => ({ '@type': 'WebSite', '@id': WEBSITE_ID, url: `${SITE}/`, name: 'VulnGPT by NovaSecLabs', inLanguage: 'en', publisher: { '@id': ORG_ID } });
const crumbNode = (id, items) => ({
  '@type': 'BreadcrumbList', '@id': id,
  itemListElement: items.map(([name, item], k) => ({ '@type': 'ListItem', position: k + 1, name, item })),
});

// ---------- pages ----------

function tocHtml(headings) {
  const groups = [];
  for (const h of headings) {
    if (h.level === 2) groups.push({ h, kids: [] });
    else if (h.level === 3 && groups.length) groups[groups.length - 1].kids.push(h);
  }
  if (groups.length < 2) return '';
  const link = (h) => `<a href="#${h.id}">${esc(h.text)}</a>`;
  const items = groups
    .map((g) => `<li>${link(g.h)}${g.kids.length ? `\n<ol>\n${g.kids.map((k) => `<li>${link(k)}</li>`).join('\n')}\n</ol>\n` : ''}</li>`)
    .join('\n');
  return `<aside class="doc-aside">
<nav class="doc-toc" aria-label="On this page" data-spy>
<details open>
<summary>On this page</summary>
<ol>
${items}
</ol>
</details>
</nav>
</aside>`;
}

function docPage(doc, chromeParts) {
  const cat = CATS.find((c) => c.id === doc.cat);
  const siblings = DOCS.filter((d) => d.cat === doc.cat).map((d) => byFile.get(d.file));
  const idx = siblings.findIndex((d) => d.slug === doc.slug);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];
  const related = doc.related.map((s) => bySlug.get(s)).filter(Boolean);
  const toc = tocHtml(doc.headings);
  const ld = [
    websiteNode(),
    {
      '@type': 'TechArticle', '@id': `${doc.url}#article`, headline: doc.h1, description: doc.desc, url: doc.url,
      mainEntityOfPage: doc.url, inLanguage: 'en', dateModified: doc.date, articleSection: cat.name,
      wordCount: doc.words, timeRequired: `PT${doc.minutes}M`,
      image: `${SITE}/assets/social/og-doc.png`,
      author: { '@id': ORG_ID }, publisher: { '@id': ORG_ID },
      isPartOf: [{ '@id': WEBSITE_ID }, { '@id': `${SITE}/docs/#webpage` }],
      about: { '@id': PRODUCT_ID },
    },
    crumbNode(`${doc.url}#breadcrumb`, [['Home', `${SITE}/`], ['Documentation', `${SITE}/docs/`], [doc.short, doc.url]]),
  ];
  return `${head({ title: doc.titleTag, desc: doc.desc, url: doc.url, image: `${SITE}/assets/social/og-doc.png`, imageAlt: DOC_IMAGE_ALT, ogType: 'article', ld })}<body>
<a class="skip-link" href="#main">Skip to main content</a>
${chromeParts.header}
<main id="main">
<section class="page-hero doc-head">
<div class="container">
<nav class="crumbs" aria-label="Breadcrumb">
<ol>
<li><a href="/">Home</a></li>
<li><a href="/docs/">Documentation</a></li>
<li aria-current="page">${esc(doc.short)}</li>
</ol>
</nav>
<p class="eyebrow"><b>${esc(cat.name)}</b> · VulnGPT by NovaSecLabs</p>
<h1>${esc(doc.h1)}</h1>
<p class="lede">${esc(doc.desc)}</p>
<p class="doc-meta"><span>${doc.minutes} min read</span><span>Last updated <time datetime="${doc.date}">${longDate(doc.date)}</time></span><a class="link" href="${doc.source}" rel="noopener">View source on GitHub</a></p>
</div>
</section>
<div class="container doc-layout${toc ? '' : ' doc-layout--solo'}">
${toc}
<div class="doc-main">
<article class="prose doc-prose">
${doc.html}
</article>
<section class="doc-related" aria-labelledby="related-h">
<h2 id="related-h">Related documentation</h2>
<ul>
${related.map((r) => `<li><a href="${r.path}"><h3>${esc(r.short)}</h3><p>${esc(r.blurb)}</p></a></li>`).join('\n')}
</ul>
</section>
<nav class="doc-pager" aria-label="More in ${esc(cat.name)}">
${prev ? `<a class="doc-pager__prev" rel="prev" href="${prev.path}"><span>Previous in ${esc(cat.name)}</span>${esc(prev.short)}</a>` : '<span></span>'}
${next ? `<a class="doc-pager__next" rel="next" href="${next.path}"><span>Next in ${esc(cat.name)}</span>${esc(next.short)}</a>` : '<span></span>'}
</nav>
<aside class="doc-cta" aria-labelledby="cta-h">
<h2 id="cta-h">Evaluate VulnGPT in private beta</h2>
<p>VulnGPT by NovaSecLabs is in private beta. This page describes product direction and evaluation guidance. It does not guarantee that every capability is currently available.</p>
<div class="doc-cta__actions">
<a class="btn btn--primary" href="${utm(doc.slug)}">Request private beta</a>
<a class="link" href="${doc.source}" rel="noopener">View source on GitHub</a>
</div>
<p class="hero__auth">For applications you own or are authorized to test.</p>
</aside>
</div>
</div>
</main>
${chromeParts.footer}
</body>
</html>
`;
}

function hubPage(chromeParts, docs, intro) {
  const url = `${SITE}/docs/`;
  const total = docs.length + EXTERNAL_REFS.length;
  const hubDate = docs.map((d) => d.date).sort().pop();
  const ld = [
    websiteNode(),
    {
      '@type': 'CollectionPage', '@id': `${url}#webpage`, url, name: 'VulnGPT Documentation', description: HUB.desc, inLanguage: 'en',
      isPartOf: { '@id': WEBSITE_ID }, about: { '@id': PRODUCT_ID }, publisher: { '@id': ORG_ID },
      breadcrumb: { '@id': `${url}#breadcrumb` }, mainEntity: { '@id': `${url}#list` }, dateModified: hubDate,
      primaryImageOfPage: { '@type': 'ImageObject', url: `${SITE}/assets/social/og-docs.png` },
    },
    {
      '@type': 'ItemList', '@id': `${url}#list`, name: 'VulnGPT documentation', numberOfItems: docs.length,
      itemListElement: orderedDocs(docs).map((d, k) => ({ '@type': 'ListItem', position: k + 1, url: d.url, name: d.h1 })),
    },
    crumbNode(`${url}#breadcrumb`, [['Home', `${SITE}/`], ['Documentation', url]]),
  ];
  const sections = CATS.map((cat) => {
    const rows = docs.filter((d) => d.cat === cat.id).map((d) =>
      `<li data-doc="${d.slug}"><a href="${d.path}"><h3>${esc(d.short)}</h3><p>${esc(d.blurb)}</p><span class="doc-list__meta">${d.minutes} min read</span></a></li>`);
    const refs = EXTERNAL_REFS.filter((r) => r.cat === cat.id).map((r) =>
      `<li data-doc="${slugify(r.title)}"><a href="${GH}${r.path}" rel="noopener"><h3>${esc(r.title)}</h3><p>${esc(r.blurb)}</p><span class="doc-list__meta">On GitHub</span></a></li>`);
    return `<section class="doc-cat" id="${cat.id}" aria-labelledby="cat-${cat.id}-h" data-cat>
<div class="doc-cat__head">
<h2 id="cat-${cat.id}-h">${esc(cat.name)}</h2>
<p>${esc(cat.blurb)}</p>
</div>
<ol class="doc-list">
${[...rows, ...refs].join('\n')}
</ol>
</section>`;
  }).join('\n');
  return `${head({ title: HUB.title, desc: HUB.desc, url, image: `${SITE}/assets/social/og-docs.png`, imageAlt: HUB.imageAlt, ogType: 'website', ld })}<body>
<a class="skip-link" href="#main">Skip to main content</a>
${chromeParts.header}
<main id="main">
<section class="page-hero doc-head">
<div class="container">
<nav class="crumbs" aria-label="Breadcrumb">
<ol>
<li><a href="/">Home</a></li>
<li aria-current="page">Documentation</li>
</ol>
</nav>
<p class="eyebrow"><b>VulnGPT by NovaSecLabs</b> · Private beta</p>
<h1>${esc(HUB.h1)}</h1>
<p class="lede">${esc(HUB.lede)}</p>
<form class="doc-search" role="search" data-doc-search>
<label for="doc-q">Search the documentation</label>
<div class="doc-search__field">
<input id="doc-q" name="q" type="search" autocomplete="off" spellcheck="false" placeholder="Search: BOLA, retest, privacy">
<kbd aria-hidden="true">/</kbd>
<button type="button" class="doc-search__clear" hidden>Clear</button>
</div>
<p class="doc-search__count" id="doc-count" role="status" aria-live="polite" data-total="${total}">${total} documents</p>
</form>
</div>
</section>
<div class="container doc-hub">
<section class="doc-start" id="start" aria-labelledby="start-h" data-hide-on-search>
<div class="doc-cat__head">
<h2 id="start-h">Where to start</h2>
<p>Pick the row that matches your role. Each path lists the documents to read, in order.</p>
</div>
<div class="prose doc-start__body">
${intro.start}
</div>
</section>
${sections}
<section class="doc-reading" aria-labelledby="reading-h" data-hide-on-search>
<div class="doc-cat__head">
<h2 id="reading-h">Reading these documents accurately</h2>
</div>
<div class="prose doc-start__body">
${intro.reading}
</div>
</section>
<p class="doc-nomatch" id="doc-nomatch" hidden>No document matches that search. Clear it to see the full library.</p>
</div>
<aside class="doc-cta doc-cta--hub" aria-labelledby="cta-h">
<div class="container">
<h2 id="cta-h">Evaluate VulnGPT in private beta</h2>
<p>VulnGPT by NovaSecLabs is in private beta. The documentation describes product direction and evaluation guidance. It does not guarantee that every capability is currently available.</p>
<div class="doc-cta__actions">
<a class="btn btn--primary" href="${utm('docs-hub')}">Request private beta</a>
<a class="link" href="https://github.com/abdallahyasser12/vulngpt-showcase/tree/main/docs" rel="noopener">Read the Markdown source on GitHub</a>
</div>
<p class="hero__auth">For applications you own or are authorized to test.</p>
</div>
</aside>
</main>
${chromeParts.footer}
</body>
</html>
`;
}

// ---------- data files ----------

const orderedDocs = (docs) => CATS.flatMap((c) => docs.filter((d) => d.cat === c.id));

function searchIndex(docs) {
  const items = orderedDocs(docs).map((d) => ({
    title: d.short, heading: d.h1, description: d.desc, category: CATS.find((c) => c.id === d.cat).name,
    url: d.path, minutes: d.minutes, headings: d.headings.filter((h) => h.level <= 3).map((h) => h.text),
  }));
  for (const r of EXTERNAL_REFS) {
    items.push({ title: r.title, heading: r.title, description: r.blurb, category: CATS.find((c) => c.id === r.cat).name, url: `${GH}${r.path}`, minutes: 0, headings: [], external: true });
  }
  return `${JSON.stringify(items, null, 1)}\n`;
}

function approvedWording() {
  const claims = read('CLAIMS.md');
  const product = claims.match(/^> (VulnGPT is an autonomous web application security testing product by NovaSecLabs[^\n]*)$/m)?.[1];
  const definition = claims.match(/^> (Autonomous means VulnGPT plans and runs[^\n]*)$/m)?.[1];
  if (!product || !definition) throw new Error('CLAIMS.md: approved autonomous product description or definition sentence not found');
  return { product, definition };
}

function sitemap(docs) {
  const urls = [
    [`${SITE}/`, gitDate('index.html')],
    [`${SITE}/product/`, gitDate('product/index.html')],
    [`${SITE}/docs/`, docs.map((d) => d.date).sort().pop()],
    ...orderedDocs(docs).map((d) => [d.url, d.date]),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([loc, mod]) => `  <url><loc>${loc}</loc><lastmod>${mod}</lastmod></url>`).join('\n')}
</urlset>
`;
}

function llmsTxt(docs) {
  const { product, definition } = approvedWording();
  const lines = [
    '# VulnGPT by NovaSecLabs: product showcase',
    '',
    `> ${product}`,
    '',
    definition,
    '',
    'VulnGPT by NovaSecLabs is a commercial product of NovaSecLabs. It is distinct from other projects that share the name VulnGPT. It is intended only for applications you own or are authorized to test.',
    '',
    '## Product',
    '',
    `- [Home](${SITE}/): what VulnGPT is designed to do, the evidence standard behind it, and the limits of the product`,
    `- [Product tour](${SITE}/product/): five unedited interface captures (dashboard, findings, a BOLA finding, Live Vision, reports) with the limits of each`,
    `- [Request private beta](${MAIN}/waitlist): apply for private-beta access`,
    '',
    '## Documentation',
    '',
    `- [Documentation index](${SITE}/docs/): searchable library of all public documents`,
    ...orderedDocs(docs).map((d) => `- [${d.h1}](${d.url}): ${d.desc}`),
    '',
    '## Company',
    '',
    `- [NovaSecLabs](${MAIN}/): the company behind VulnGPT`,
    `- [VulnGPT on novaseclabs.com](${MAIN}/vulngpt): the main product page`,
    `- [About](${MAIN}/about)`,
    `- [Pricing](${MAIN}/pricing)`,
    `- [Resources](${MAIN}/resources)`,
    '',
  ];
  return lines.join('\n');
}

// ---------- hub intro from docs/README.md ----------

function hubIntro() {
  const src = read('docs/README.md').replace(/\r\n?/g, '\n');
  const sec = (name) => {
    const m = src.match(new RegExp(`^## ${name}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'));
    if (!m) throw new Error(`docs/README.md: section "${name}" not found`);
    return m[1].trim();
  };
  const ctx = { notes, mapUrl: (u, k) => mapUrl(u, 'docs/README.md', k), tableLabel: () => 'Recommended reading paths by reader', heading: () => '' };
  return { start: renderBlocks(sec('Start here'), ctx), reading: renderBlocks(sec('Reading these documents accurately'), ctx) };
}

// ---------- build ----------

const loaded = DOCS.map(loadDoc);
const byFile = new Map(loaded.map((d) => [d.file, d]));
const bySlug = new Map(loaded.map((d) => [d.slug, d]));

// validate curated data
for (const d of loaded) {
  if (d.desc.length < 110 || d.desc.length > 155) errors.push(`${d.rel}: description is ${d.desc.length} chars (need 110-155)`);
  if (d.titleTag.length > 60) errors.push(`${d.rel}: title is ${d.titleTag.length} chars (max 60)`);
  for (const r of d.related) if (!bySlug.has(r)) errors.push(`${d.rel}: unknown related slug ${r}`);
}
if (HUB.desc.length < 110 || HUB.desc.length > 155) errors.push(`hub description is ${HUB.desc.length} chars`);
if (HUB.title.length > 60) errors.push(`hub title is ${HUB.title.length} chars`);
const onDisk = fs.readdirSync(path.join(ROOT, 'docs')).filter((f) => f.endsWith('.md') && f !== 'README.md').map((f) => f.slice(0, -3));
for (const f of onDisk) if (!byFile.has(f)) errors.push(`docs/${f}.md has no entry in the build configuration`);

const chromeParts = chrome();
const outputs = new Map();
outputs.set('docs/index.html', hubPage(chromeParts, loaded, hubIntro()));
for (const d of loaded) outputs.set(`docs/${d.slug}/index.html`, docPage(d, chromeParts));
outputs.set('docs/search-index.json', searchIndex(loaded));
outputs.set('sitemap.xml', sitemap(loaded));
outputs.set('llms.txt', llmsTxt(loaded));

if (errors.length) {
  console.error('build-docs: errors');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

// dates move with git history, so --check compares everything except date values
const normalize = (s) =>
  s.replace(/"dateModified":"\d{4}-\d{2}-\d{2}"/g, '"dateModified":"D"')
    .replace(/<lastmod>[^<]*<\/lastmod>/g, '<lastmod>D</lastmod>')
    .replace(/<time datetime="[^"]*">[^<]*<\/time>/g, '<time>D</time>');

const expectedDirs = new Set(loaded.map((d) => d.slug));
const orphans = fs.readdirSync(path.join(ROOT, 'docs'), { withFileTypes: true })
  .filter((e) => e.isDirectory() && !expectedDirs.has(e.name)).map((e) => `docs/${e.name}/`);

if (CHECK) {
  const stale = [];
  for (const [rel, content] of outputs) {
    const file = path.join(ROOT, rel);
    if (!fs.existsSync(file)) { stale.push(`${rel} (missing)`); continue; }
    if (normalize(fs.readFileSync(file, 'utf8')) !== normalize(content)) stale.push(rel);
  }
  for (const o of orphans) stale.push(`${o} (not generated by any source document)`);
  if (stale.length) {
    console.error(`build-docs --check: ${stale.length} generated file(s) are out of date. Run: node scripts/build-docs.mjs`);
    for (const s of stale) console.error(`  - ${s}`);
    process.exit(1);
  }
  console.log(`build-docs --check: ${outputs.size} generated files match their sources (${loaded.length} documentation pages).`);
} else {
  let changed = 0;
  for (const [rel, content] of outputs) {
    const file = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content) { fs.writeFileSync(file, content); changed += 1; }
  }
  console.log(`build-docs: ${loaded.length} documentation pages + hub, search index, sitemap.xml, llms.txt (${changed} file(s) written, ${outputs.size - changed} unchanged).`);
  for (const o of orphans) console.log(`  note: ${o} is not generated by any source document; remove it.`);
  const diagrams = notes.filter((n) => n.startsWith('mermaid')).length;
  if (diagrams) console.log(`  ${diagrams} branching Mermaid chart(s) rendered as labelled source.`);
  for (const d of loaded) console.log(`  /docs/${d.slug}/  ${d.minutes} min  ${d.headings.length} headings`);
}
