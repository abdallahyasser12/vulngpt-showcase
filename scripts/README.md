# Repository scripts

All scripts use only Node.js built-ins (Node 22 or later). Run them from the repository root.

| Command | Purpose |
| --- | --- |
| `node scripts/validate-public-repo.mjs` | Single entry point. Content, wording, metadata and structured-data checks, then runs the three scripts below. |
| `node scripts/build-docs.mjs` | Renders `docs/*.md` into `docs/<name>/index.html`, the documentation index, `docs/search-index.json`, `sitemap.xml` and `llms.txt`. Commit the output. |
| `node scripts/build-docs.mjs --check` | Fails if any generated file differs from its sources (date values are ignored). |
| `node scripts/check-links.mjs` | Offline integrity check: links, fragments, canonical URLs, sitemap parity, metadata, JSON-LD, accessibility basics. |
| `node scripts/check-links.mjs --external` | Adds HEAD requests for external links. Needs network access; not part of the default run. |
| `node scripts/test-vercel-config.mjs` | Simulates the redirect and header rules in `vercel.json` against sample hosts and paths. |

`scripts/dev/` holds authoring scripts for brand and image assets (they need Python, Pillow, numpy and an existing Playwright install, and are never run by the validator). See [Asset Notes](../assets/README.md).

See [Repository Maintenance](../docs/REPOSITORY_MAINTENANCE.md) for scope and limitations.
