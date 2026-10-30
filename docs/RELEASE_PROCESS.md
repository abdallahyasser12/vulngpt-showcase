# Public Repository Release Process

## Scope

This process applies only to the public VulnGPT showcase website and documentation repository. It does not define scanner-engine releases, backend deployments, customer rollouts, or private product release controls.

## Release principles

- Publish only content reviewed against approved product claims.
- Prefer small, reviewable pull requests.
- Validate local links, references, metadata, and public-content guardrails before merge.
- Review the Vercel preview when the platform can build it.
- Do not treat a preview deployment as evidence of scanner-engine correctness.
- Keep historical release records and corrections visible.

## Change classification

| Change type | Examples | Expected handling |
| --- | --- | --- |
| Documentation | Copy corrections, glossary, technical explanation | Review factual claims and local references |
| Website | Layout, metadata, accessible navigation | Review desktop/mobile and keyboard behavior |
| Trust and policy | Security, privacy, benchmark, compliance wording | Require explicit evidence and owner review |
| Brand assets | Logo, mascot, social card, screenshots | Verify provenance, continuity, and permissions |
| Release metadata | Tags, changelog, publication note | Publish only for an actual reviewed release |

## Pre-merge checklist

1. Confirm that changes affect only the public showcase repository.
2. Inspect the exact diff and check for private implementation detail or customer information.
3. Review all new capability, security, privacy, metric, customer, and compliance language.
4. Run `node scripts/validate-public-repo.mjs`.
5. Confirm local links and images resolve.
6. Check semantic HTML, keyboard navigation, reduced motion, and responsive layout for web changes.
7. Review the available Vercel preview and record any platform limitation.
8. Update the changelog for material public changes.
9. Confirm the PR title and description accurately describe the change.
10. Merge using the repository's approved review and merge policy.

## Publication and rollback

A merge to the default branch may trigger the connected static-site deployment. Confirm the resulting deployment and public URL before announcing a website change.

If a public change is materially incorrect:

- revert the offending commit or merge through a reviewed change;
- preserve the correction history;
- verify the replacement deployment;
- update benchmark or claims notices if the correction affects public statements.

Do not rewrite published history to conceal a material correction.

## Release notes

Use the repository's release template for actual public releases. Do not create a version or release solely to make the repository appear active. A documentation merge does not necessarily warrant a product release.

## Related resources

- [Repository Maintenance](REPOSITORY_MAINTENANCE.md)
- [Claims and Messaging](../CLAIMS.md)
- [Benchmark Governance](BENCHMARK_GOVERNANCE.md)
- [Changelog](../CHANGELOG.md)
