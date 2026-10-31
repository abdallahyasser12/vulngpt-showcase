# Repository Maintenance

## Purpose

This repository contains the static public showcase and public product documentation for VulnGPT. It is not the private product implementation repository.

The production-facing showcase hostname is [showcase.novaseclabs.com](https://showcase.novaseclabs.com/). The Vercel project is a hosting detail, not the product's public identity.

The maintenance goal is to keep public information accurate, navigable, accessible, searchable, and safe to publish. The searchable documentation library is generated from the Markdown files in this directory (see "Documentation build") and is served from [docs/index.html](index.html) at [showcase.novaseclabs.com/docs/](https://showcase.novaseclabs.com/docs/).

## Local validation

The repository uses only Node.js built-ins (Node 22 or later). No dependency installation is required. `node scripts/validate-public-repo.mjs` is the single entry point: it runs the content checks below and also calls the documentation build check and the link checker.

From the repository root:

```bash
node --version
node scripts/validate-public-repo.mjs
```

The validator checks relative Markdown links and image references, required metadata on every public page, structured data, wording guardrails (approved autonomous wording, no withdrawn benchmark scores, no unqualified claims), the Vercel configuration, and the sitemap, robots, and llms.txt files. It then runs:

- `node scripts/build-docs.mjs --check`, which fails if any generated documentation page, the search index, `sitemap.xml`, or `llms.txt` differs from what the Markdown sources produce;
- `node scripts/check-links.mjs`, which resolves every internal link, image, canonical URL, and fragment, checks sitemap parity, one H1 per page, image dimensions and alt text, the absence of inline scripts and styles, JSON-LD identifiers, title and description lengths, and duplicates.

`node scripts/check-links.mjs --external` additionally sends HEAD requests to external links (it needs network access and is not part of the default run). Main-site pages that ship separately are reported as PENDING rather than failing.

`node scripts/test-vercel-config.mjs` simulates the redirect and header rules in `vercel.json` against sample hosts and paths.

The validator does not test browser rendering, formal accessibility conformance, SEO ranking, or the private VulnGPT service. It is a repository hygiene check, not a full static-analysis or security-scanning product.

## Documentation build

Each Markdown file in this directory (except `README.md`, which supplies the reading paths on the documentation index) is published as a page at `/docs/<file-name-in-kebab-case>/`. After editing any document, or the header and footer of `index.html`, regenerate the pages and commit the result:

```bash
node scripts/build-docs.mjs
```

A new document also needs an entry (category, short title, description, related pages) in the configuration at the top of `scripts/build-docs.mjs`; the build fails if a Markdown file has no entry.

## Hosting configuration

`vercel.json` configures the static host. It enforces one canonical URL per page (trailing-slash routes, no `.html` duplicates), permanently redirects the production alias `vulngpt-showcase.vercel.app` to `showcase.novaseclabs.com`, marks every other `*.vercel.app` preview host `noindex`, and sets security headers including a strict Content-Security-Policy (`'self'` only, no inline scripts or styles, so pages must never contain inline `<script>`, `<style>` or `style=""`).

Cache lifetimes: HTML revalidates on every request; `/css/**` and the JavaScript files revalidate on every request, so a deploy never pairs new HTML with old styles; images and other `/assets/**` files are cached for seven days (file names are not content-hashed); `/assets/fonts/**` is cached for a year as `immutable`, so a changed font file must be given a new file name and `css/fonts.css` updated to match.

## Content review

Before publishing changes:

1. Confirm product capabilities against a current, approved product artifact.
2. Separate product direction from currently available private-beta functionality.
3. Obtain review for customer, metric, benchmark, security, privacy, and compliance claims.
4. Keep security findings, secrets, customer data, and internal infrastructure out of public files.
5. Identify screenshots accurately and verify that they contain no confidential information.
6. Update the changelog for material public changes.

## Asset management

Use authentic, approved brand assets. Preserve the VulnGPT mascot's established design and do not introduce unofficial variants. Keep alt text descriptive and distinguish public website screenshots from authenticated product UI captures.

See [Asset Notes](../assets/README.md).

## Releases and change history

This repository's static showcase is deployed independently from the private VulnGPT application. Website changes should be reviewed against the connected preview before they are merged. A successful static-site build is not validation of the scanner engine or backend.

Use [CHANGELOG.md](../CHANGELOG.md) to record material public changes. Follow the [Release Process](RELEASE_PROCESS.md) and use the [release template](../.github/RELEASE_TEMPLATE.md) when publishing an actual public release. Avoid publishing version numbers or release dates that do not correspond to an actual release.

## Ownership and escalation

The repository's GitHub ownership and access settings define who can merge changes. For product questions, use [Support](../SUPPORT.md). For security concerns, use [SECURITY.md](../SECURITY.md).
