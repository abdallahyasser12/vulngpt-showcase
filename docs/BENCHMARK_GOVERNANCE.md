# Benchmark Governance and Publication Standard

## Purpose

This document defines the minimum governance expected before publishing a performance or detection benchmark for VulnGPT.

It exists to prevent unsupported comparisons, denominator ambiguity, selective reporting, and broad claims that exceed the tested conditions.

## Current publication status

The G1 public score explanation remains under review. Historic G1 figures are not approved for current marketing use until the frozen source evidence, row-level scoring, and written explanation reconcile. See [BENCHMARK_G1.md](../BENCHMARK_G1.md).

This policy does not reinstate, validate, or reinterpret any withdrawn historical result.

## Required benchmark record

A publishable benchmark record must identify:

- benchmark name, version, and ownership;
- exact target and scenario inventory;
- frozen ground-truth source and version;
- inclusion and exclusion rules;
- positive, negative, ambiguous, and unobservable scenario counts;
- exact run configuration and environment;
- engine and supporting component versions where appropriate;
- timeouts, retries, and resource constraints;
- scoring implementation and version;
- finding-to-ground-truth matching rules;
- adjudication rules and taxonomy treatment;
- raw outputs and row-level evidence;
- repeated-run variance and reproducibility;
- false-positive and false-negative definitions;
- limitations, conflicts of interest, and independence status.

## Denominator and score integrity

Every published numerator and denominator must be derivable from the row-level result set.

If an adjusted or adjudicated score is published, disclose:

1. the raw denominator;
2. every excluded row and exclusion reason;
3. every credited row and credit rule;
4. the adjusted denominator;
5. the resulting numerator;
6. the exact mapping from source rows to published totals.

A prose explanation that does not reconcile with the underlying export is a publication blocker.

## Required result separation

Keep these outcomes distinct:

- not executed;
- execution incomplete;
- executed but unobservable;
- ambiguous;
- invalid ground truth;
- out of scope;
- correctly detected;
- missed;
- false positive;
- taxonomy mismatch or alternative classification;
- independently adjudicated result.

Do not convert missing evidence, a timeout, or an unexecuted scenario into a pass or a negative finding.

## Reproducibility controls

Before publication:

- reproduce the result from a clean environment;
- preserve exact input inventory and output artifacts;
- verify the scoring code against known test vectors;
- independently inspect row-to-summary aggregation;
- compare repeated runs and explain variance;
- confirm that benchmark-specific answers or labels do not influence the system under evaluation;
- retain a versioned publication bundle.

## Independence and conflicts

Clearly identify who designed the benchmark, who implemented the system, who ran the tests, and who adjudicated results. If the same team controls those stages, state that explicitly.

"Internal", "reproduced", "frozen", "independently evaluated", and "certified" are not interchangeable terms.

## Publication approval gates

A benchmark may be published only when all gates are satisfied:

| Gate | Required evidence | Blocking condition |
| --- | --- | --- |
| Inventory | Versioned scenario list | Unknown or changing denominator |
| Ground truth | Reviewable source and rules | Invalid or unverified labels |
| Execution | Complete run records | Incomplete runs presented as complete |
| Scoring | Deterministic row-level output | Summary arithmetic does not reconcile |
| Adjudication | Written, repeatable rules | Informal or selective credit |
| Reproduction | Clean repeat runs | Unexplained variance |
| Disclosure | Limitations and conflicts | Unsupported independence or certification language |
| Approval | Named publication owner and reviewers | No accountable sign-off |

## Approved language principles

- State the benchmark scope and version next to the result.
- Describe internal benchmarks as internal.
- Report raw results and adjusted views together where both are relevant.
- Avoid universal "zero false positives" statements.
- Do not translate a benchmark score into a real-world detection rate.
- Do not compare products unless the methodology and test conditions are meaningfully comparable.
- Publish a correction when a material error is found; do not silently overwrite historical context.

## Publication record template

For a future benchmark, create a versioned report containing:

- executive summary;
- benchmark ownership and independence disclosure;
- dataset and ground-truth description;
- environment and run configuration;
- scoring definitions;
- raw and adjudicated result tables;
- row-level downloadable evidence where safe;
- reproducibility record;
- limitations and exclusions;
- reviewer and approval record;
- correction history.

The benchmark publication page should link to this governance standard and the exact versioned evidence bundle.
