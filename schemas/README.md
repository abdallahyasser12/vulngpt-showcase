# Public Evaluation Schemas

## Purpose

These JSON Schemas describe optional, customer-controlled interchange formats for documenting a security finding and a benchmark report.

They are public evaluation resources. **They are not VulnGPT API contracts, internal database models, product export specifications, or a promise that the current private beta imports or exports these formats.**

## Files

- [Finding record schema](finding-record.schema.json) — a bounded, evidence-oriented application-security finding.
- [Benchmark report schema](benchmark-report.schema.json) — benchmark identity, ground truth, execution outcomes, scoring counts, independence, and limitations.

## Design principles

- Separate observation, evidence, adjudication, and impact.
- Make test context explicit.
- Require limitations and uncertainty to be recorded.
- Preserve the distinction between incomplete/unobservable scenarios and negative results.
- Keep raw counts alongside derived metrics.
- Do not include secrets or unnecessary personal data.

## Validation

Both schema files are JSON documents using JSON Schema Draft 2020-12. The repository's local validator checks JSON syntax and required schema metadata. Full validation of a record against a schema should use a standards-compliant JSON Schema validator in the consuming environment.

The schema files intentionally do not contain actual VulnGPT customer results or benchmark scores.
