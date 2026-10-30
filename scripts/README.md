# Repository validation script

Run from the repository root:

```bash
node scripts/validate-public-repo.mjs
```

The script uses only Node.js built-ins. It checks local references, key public metadata, structured data, keyboard entry points, and publication guardrails. It does not access the network or inspect the private VulnGPT application.

See [Repository Maintenance](../docs/REPOSITORY_MAINTENANCE.md) for scope and limitations.
