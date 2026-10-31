# Repository scripts

All scripts use only Node.js built-ins (Node 22 or later). Repository paths are resolved from each script's location, so the checks can also be invoked from another working directory.

| Command | Purpose |
| --- | --- |
| `node scripts/validate-public-repo.mjs` | Single entry point. Content, wording, metadata and structured-data checks, resolver regression tests, then the build, link and hosting checks below. |
| `node scripts/build-docs.mjs` | Renders `docs/*.md` into `docs/<name>/index.html`, the documentation index, `docs/search-index.json`, `sitemap.xml` and `llms.txt`. Commit the output. |
| `node scripts/build-docs.mjs --check` | Fails if any generated file differs from its sources (date values are ignored). |
| `node scripts/test-local-reference.mjs` | Unit tests for cwd-independent root detection, URL decoding, root-relative and relative paths, and traversal rejection. Also included in the main validator. |
| `node scripts/check-links.mjs` | Offline integrity check: links, fragments, canonical URLs, sitemap parity, metadata, JSON-LD, accessibility basics. Malformed URL paths or fragments are reported without aborting the run. |
| `node scripts/check-links.mjs --external` | Adds HEAD requests for external links. Needs network access; not part of the default run. |
| `node scripts/test-vercel-config.mjs` | Simulates the redirect and header rules in `vercel.json` against sample hosts and paths. |

`scripts/dev/` holds authoring scripts for brand and image assets (they need Python, Pillow, numpy and an existing Playwright install, and are never run by the validator). See [Asset Notes](../assets/README.md).

See [Repository Maintenance](../docs/REPOSITORY_MAINTENANCE.md) for scope and limitations.
