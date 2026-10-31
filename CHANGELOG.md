# Changelog

All notable public changes to the VulnGPT showcase and its documentation are recorded here.

This changelog covers this public repository only. It does not describe private scanner-engine releases, backend deployments, or customer-specific changes.

The format follows the principles of Keep a Changelog. Dates and version identifiers are added only when a corresponding release or publication is made.

## [Unreleased]

### Redesign, documentation pages, and search infrastructure
- New design system for the whole showcase: self-hosted Newsreader, Instrument Sans, and JetBrains Mono (no third-party font requests), shared design tokens with light and dark schemes, a shared header and footer, and a rebuilt home page, product tour, and 404 page.
- Every document in `docs/` is now a real, indexable page at `/docs/<name>/` with a table of contents, reading time, related documents, previous and next navigation, breadcrumbs, and structured data. The documentation index at `/docs/` is generated from the same sources, with a keyboard-accessible search over `docs/search-index.json`.
- `scripts/build-docs.mjs` (dependency-free) renders the Markdown, the index, the search index, `sitemap.xml`, and `llms.txt`; `--check` fails when committed output is out of date.
- Added `vercel.json` (trailing-slash routes, redirect from the production alias to the branded host, noindex for preview hosts, security and cache headers, a strict Content-Security-Policy), a refreshed `robots.txt` that allows AI search and retrieval crawlers and disallows training crawlers, and `llms.txt`.
- Added `scripts/check-links.mjs` (internal links, fragments, sitemap parity, canonical URLs, metadata, structured data, accessibility basics; optional `--external` check) and `scripts/test-vercel-config.mjs`; `scripts/validate-public-repo.mjs` now runs them and remains the single entry point.
- Wording: VulnGPT is now described as autonomous instead of AI-assisted, always with its fixed meaning: autonomous within the target, scope, and runtime budget you authorize, and not unsupervised. CLAIMS.md gained an "Autonomy language" section with allowed and banned phrases; the README, product overview, FAQ, and enterprise evaluation guide were aligned, and the FAQ gained "Does autonomous mean unsupervised?".
- Open Graph images regenerated for the home page, product tour, documentation index, and documents; the GitHub social preview was regenerated at 1280x640.

### Added
- Prepared the branded showcase hostname and aligned canonical URLs, structured data, sitemap, robots.txt, and security.txt; external Cloudflare DNS publication remains pending.
- Responsive full-size product screenshot viewer using the native dialog element, with a direct-image fallback.
- Searchable documentation portal at `/docs/`, with audience filters, keyboard-accessible search, and direct links to maintained Markdown sources.
- Public conceptual system overview and controlled product-evaluation protocol.
- Optional JSON Schema interchange formats for externally documented findings and benchmark reports; these are not product API contracts.
- `security.txt` contact and disclosure-policy discovery for the public showcase domain.


### Added
- Structured public documentation for product overview, technical approach, evidence validation, enterprise evaluation, security and privacy, use cases, responsible testing, and FAQ.
- A public conceptual security model with explicit trust boundaries and control-verification questions.
- A contextual application-security playbook, scenario evaluation matrix, and assessment/finding templates.
- Benchmark publication governance, a shared security glossary, and a public repository release process.
- Repository maintenance guidance and a dependency-free local content validator.
- Support guidance, issue forms, code ownership metadata, and asset provenance notes.

### Changed
- Reworked the README into a product and documentation entry point.
- Reframed benchmark publication status so unreconciled historical figures are not repeated as current marketing claims.
- Improved website metadata, structured data, keyboard navigation, and documentation discovery.
- Expanded practitioner documentation while explicitly separating evaluation guidance from a product support or coverage guarantee.

### Clarified
- The public repository is a showcase and documentation package, not the proprietary scanning engine.
- Private-beta product direction is distinct from verified availability and independent assurance.
- Enterprise security and compliance topics require current, environment-specific confirmation.


## 2026-10-31 — Product evidence showcase

- Replaced the public-site-only screenshot section with five genuine product-interface captures: dashboard, findings queue, BOLA finding detail, Live Vision, and Elite Red Team Reports.
- Added a dedicated visual product walkthrough with full-size screenshot links and capture-specific context.
- Clarified that screenshot data is static and must not be interpreted as live telemetry, customer outcomes, or guaranteed feature availability.
- Explicitly retained the export-policy limitation visible in the Elite Red Team Reports capture.
- Updated repository asset guidance, README, sitemap, and navigation.
