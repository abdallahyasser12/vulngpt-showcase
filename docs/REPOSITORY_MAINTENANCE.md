# Repository Maintenance

## Purpose

This repository contains the static public showcase and public product documentation for VulnGPT. It is not the private product implementation repository.

The maintenance goal is to keep public information accurate, navigable, accessible, searchable, and safe to publish. The searchable documentation portal is served from [docs/index.html](index.html) and is available at [vulngpt-showcase.vercel.app/docs/](https://vulngpt-showcase.vercel.app/docs/).

## Local validation

The repository uses only Node.js built-ins for its content validation script. No runtime dependency installation is required.

From the repository root:

```bash
node --version
node scripts/validate-public-repo.mjs
```

The validator checks relative Markdown links and image references, local HTML references and fragment targets, required title and social metadata, structured data, keyboard navigation, reduced-motion styling, and publication guardrails.

The validator also parses the public JSON Schema files and checks the documentation portal's local assets and navigation. It does not perform full JSON Schema instance validation. It does not test external website availability, browser rendering, formal accessibility conformance, SEO ranking, or the private VulnGPT service. It is a repository hygiene check, not a full static-analysis or security-scanning product.

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
