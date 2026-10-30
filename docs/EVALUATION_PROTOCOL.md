# Controlled Product Evaluation Protocol

## Purpose

This protocol helps a customer or independent reviewer design a fair, reproducible evaluation of an application-security testing product.

It is not a VulnGPT performance report, a claim of benchmark completion, or a promise of feature coverage. VulnGPT is in private beta; the precise product scope and execution conditions must be agreed before evaluation.

## 1. Pre-register the evaluation

Before the first run, record the evaluation owner and independent reviewer; product build or version identifier where available; target application and environment; authorization and approved scope; scenario inventory and scenario versions; expected ground truth for each scenario; test identities, roles, tenants, and relevant object ownership; allowed actions, prohibited actions, rate and concurrency limits; timeout, retry, and resource rules; evidence required for adjudication; scoring and exclusion rules; success criteria; and stop conditions.

Do not change the rules after seeing results without recording a versioned amendment and explaining its effect.

## 2. Design a balanced scenario set

| Category | Purpose |
| --- | --- |
| Known positive | A controlled, independently established security violation should be observable |
| Known negative | A legitimate behavior should not be reported as a vulnerability |
| Boundary pair | Two scenarios differ by one relevant variable such as actor, role, ownership, or state |
| Ambiguous | Known interference or incomplete observability tests conservative interpretation |
| Retest | A known remediation should restore the defined security invariant |

Use synthetic test data and a staging environment wherever possible.

## 3. Freeze ground truth

For every scenario, record a unique scenario ID and version; expected secure or vulnerable condition; security invariant; relevant actor, role, tenant, object owner, and state; setup and reset procedure; expected observable evidence; independent source of truth; and adjudication owner.

Ground truth must not be inferred from the product's own result. Prefer a controlled fixture, source-owner verification, or an independent reviewer.

## 4. Classify execution outcomes separately

| Outcome | Meaning |
| --- | --- |
| Executed and observable | The scenario ran and produced evidence suitable for review |
| Executed but unobservable | It ran, but the expected behavior could not be reliably observed |
| Incomplete | The run stopped before the scenario's required actions were completed |
| Not executed | The scenario was not attempted |
| Invalid ground truth | The expected result could not be independently established |
| Out of scope | The scenario was excluded by authorization or evaluation rules |
| Ambiguous | Conflicting or insufficient observations prevent a bounded conclusion |

Do not collapse all outcomes into pass/fail. An unexecuted, incomplete, or unobservable scenario must not be converted into a true negative or a successful detection.

## 5. Adjudicate positive and negative cases

For a known-positive scenario:

- **True positive:** a valid, evidence-supported finding matches the ground-truth weakness.
- **False negative:** the scenario was fully executed and observable, but the expected weakness was not identified under the pre-registered matching rules.
- **Unscored:** evidence, scope, execution, or ground truth is insufficient for classification.

For a known-negative scenario:

- **True negative:** no unsupported finding is raised under the pre-registered rules.
- **False positive:** a finding is raised that contradicts the independently established secure ground truth.
- **Unscored:** execution or evidence is insufficient to decide.

## 6. Report metrics with explicit denominators

At minimum, report raw counts for known-positive and known-negative cases, true positives, false negatives, true negatives, false positives, incomplete scenarios, unobservable scenarios, unexecuted scenarios, invalid ground truth, and exclusions.

Where the evaluation supports them, define:

[
\text{Precision} = \frac{TP}{TP + FP}
]

[
\text{Recall} = \frac{TP}{TP + FN}
]

[
\text{Specificity} = \frac{TN}{TN + FP}
]

State the denominator and number of unscored cases beside every metric. If a denominator is zero, report the metric as not applicable rather than zero or one.

Do not describe a small, self-selected scenario set as a universal real-world detection rate. Keep coverage, execution completion, observability, correctness, and evidence quality separate.

## 7. Preserve reproducibility

Record the run configuration, environment, relevant logs, artifact hashes where possible, scenario reset state, and exact scoring implementation. Repeat the evaluation when practical and disclose run-to-run variation. A benchmark report should include raw row-level outcomes or a reviewable evidence bundle, not only an aggregate percentage.

## 8. Disclose independence and limitations

Identify who designed the scenarios, established ground truth, configured and ran the product, scored the outputs, adjudicated ambiguous cases, and approved publication. Disclose when these responsibilities are held by the same organization or team. Internal testing is not independent evaluation.

## 9. Publication gate

Do not publish a score until the scenario inventory is frozen and versioned; all numerator and denominator counts reconcile to row-level records; exclusions and unscored outcomes are explicit; scoring rules are deterministic and reviewable; an independent or clearly disclosed adjudication process is complete; limitations and conflicts are stated; and the exact public wording is approved against the source evidence.

See [Benchmark Governance](BENCHMARK_GOVERNANCE.md) for the full publication standard and [BENCHMARK_G1.md](../BENCHMARK_G1.md) for the current historical publication status.

## Related resources

- [Capability Evaluation Matrix](CAPABILITY_EVALUATION_MATRIX.md)
- [Assessment Plan Template](ASSESSMENT_PLAN_TEMPLATE.md)
- [Finding Report Standard](FINDING_REPORT_STANDARD.md)
