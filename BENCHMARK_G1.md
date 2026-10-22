# Gauntlet G1 — Benchmark Methodology & Results

> **Publication erratum — 2026-10-22:** The internal freeze certificate records raw 39/51, fp_sum=0, adjudicated 41/42, and 0 valid-in-scope misses. This public document's arithmetic explanation is inconsistent: it describes 39 exact-category passes plus 3 wrong-taxonomy credits (42 total) while reporting 41/42. The frozen certificate is not being rewritten. Until the row-level scoring evidence is reconciled and this explanation corrected, do not reuse the 41/42 or zero-miss figures as public performance claims. The benchmark is internal and has not been independently audited.


Gauntlet is VulnGPT's internal detection benchmark: 13 deliberately vulnerable web applications, each shipped with a frozen ground-truth list of what's actually exploitable in it and what isn't. This page is the public, methodology-first account of the **G1 v1.5** result (frozen 2026-09-20) — what was measured, how, under what conditions, and what the result does and doesn't mean.

**This is a benchmark we built, run, and scored ourselves.** It is not third-party audited. "Frozen" means the substrate, ground truth, and scoring code are version-locked and no longer edited for this result — it is not a claim of external certification.

## Headline result

| Measure | Result |
| --- | ---: |
| Raw historical matrix | **39 / 51** |
| False positives (sum across all 13 environments) | **0** |
| Adjudicated valid-in-scope score | **41 / 42** |
| Valid-in-scope misses remaining | **0** |

We publish the raw number and the adjudicated number together, every time. A report that shows only the larger fraction is hiding the smaller one; the gap between them is explained in full below, not waved away.

## Per-environment results

| Environment | Score | Environment | Score |
| --- | ---: | --- | ---: |
| auth_chaos | 1/1 | redirect_wall | 1/1 |
| business_logic | 5/5 | rpc | 3/3 |
| cookie | 3/3 | saas | 5/5 |
| enterprise | 9/11 | saas_v2 | 5/5 |
| graphql | 3/3 | synthetic | 3/5 |
| multiactor | 0/1 | vulnerable_test | 1/7 |
| multiactor_noboot | 0/1 | | |

Every environment independently recorded zero false positives. 12 rows (51 − 39) don't count as a raw pass — see **The 12 non-pass rows** below for exactly why each one doesn't, individually.

## How a run is scored

Each environment run produces an event log. Scoring runs as a **pure function**: identical input log always produces a byte-identical scoring result — no clock, no randomness, no network I/O inside the scoring step itself. That determinism is enforced by an automated regression test, not asserted by hand.

For each ground-truth entry, the scorer assigns one of a fixed set of verdicts (pass, a specific failure phase such as detection failure or verification failure, unreachable, ambiguous-authorization, or unknown when a signal genuinely could not be measured). A scan that never reaches a clean terminal state is flagged as reduced-confidence rather than silently scored as if it had finished normally.

**What counts as a false positive.** A reported finding is a false positive only if it matches a deliberately planted negative case at that exact endpoint, is not a documented shared-authorization edge case, and does not simultaneously match a real ground-truth vulnerability of the same type at that same endpoint (so a correct finding is never double-counted against itself). Precision is `confirmed / (confirmed + false_positives)`.

**No cheating by construction.** The scoring, matching, and ground-truth code is frozen and version-controlled separately from the detection engine. Every scoring run is checked for benchmark-specific literals (hostnames, ports, hardcoded answers) leaking into detection logic — there are none. The engine never imports ground truth, and the confirmation gate that decides whether a finding is reported is unchanged by any benchmark-driven fix; fixes only ever widen what the engine can discover or target, never what it's willing to confirm. That discipline is why false positives stayed at 0 across every iteration of this benchmark, not just this one.

**The benchmark and the detectors were developed by the same team, on the same 13 environments.** There is no held-out environment and no independent reproduction yet. Treat this result as evidence of engineering discipline on a known matrix, not as a substitute for third-party or held-out validation — we don't have that yet, and we're not implying we do.

## Why 39/51 and 41/42 are both correct — they measure different things

The raw matrix preserves all 51 historical ground-truth rows, unconditionally, and requires an exact category match to count as a pass. The adjudicated valid-in-scope score additionally credits a real, confirmed finding that the scorer filed under a closely related vulnerability category instead of the exact one ground truth expected ("wrong taxonomy, right finding"), and removes rows the benchmark itself cannot fairly judge either way:

```
51 total ground-truth rows
 − 2  explicitly out-of-scope by design (see below)
 − 3  invalid ground truth (the planted "vulnerability" doesn't hold up on inspection)
 − 4  structurally unobservable in this harness (write-only or no-readback endpoints)
──────────────────────────────────────────────
 = 42 adjudicated valid-in-scope denominator
```

Of those 42, 41 are credited (39 exact-category passes plus wrong-taxonomy rows credited as real, confirmed findings) and 0 are misses.

### The 12 non-pass rows, by category

- **2 explicitly out-of-scope** — `multiactor` and `multiactor_noboot` require a role discriminator the frozen scorer doesn't provide; these are scored `AMBIGUOUS_AUTHZ` by design, not as a detection failure.
- **3 wrong-taxonomy** — a real, confirmed finding was classified under a different (but reasonable) vulnerability category than the ground truth expected, inside `enterprise` and `vulnerable_test`. These are the rows credited under adjudication above.
- **3 invalid ground truth** — on inspection, three planted "vulnerabilities" in `vulnerable_test` don't actually hold (a SQLi row, an auth-bypass row, and a race-condition row with a labeling error).
- **4 structurally unobservable** — endpoints in `vulnerable_test` and `synthetic` are write-only or provide no readback, so no black-box scan (automated or human) could observe the outcome.

None of the 12 is an in-scope detection miss. All 12 are documented, named limitations of this benchmark's harness or taxonomy, not of the scanner.

## Run conditions

- sandbox profile, no live external targets;
- offline — no LLM calls during scoring-relevant detection, so results aren't affected by model drift or provider variance;
- every environment's working directory is wiped before each run (no reused logs, no partial-run credit);
- a fixed wall-clock cap per environment, applied uniformly;
- the benchmark substrate and ground truth are frozen for the lifetime of this result.

## Reproducibility

G1 v1.5 was reproduced twice at **39/51, fp_sum=0** before being frozen. Two environments (`saas_v2`, `enterprise`) had shown run-to-run score variance in earlier iterations (v1.2–v1.4); both were root-caused to specific, named mechanisms in the detection pipeline, fixed, and re-verified with paired on/off comparisons — the fix disabled reproduces the prior (lower, inconsistent) score exactly; the fix enabled produces the improved score consistently across repeated runs. Neither fix touched the frozen scoring/matching code or added any benchmark-specific logic.

## What this result is, and isn't

This is a **controlled, internal, reproducible benchmark result**, obtained under the documented conditions above, scored by code and ground truth we built ourselves. It is:

- not third-party audited or independently reproduced;
- not a claim that VulnGPT detects 97.6% of vulnerabilities in arbitrary real-world applications;
- not a claim that false positives are impossible outside this benchmark;
- not a claim that this result transfers unchanged to a live, authenticated, production-scale target.

## Approved public wording

Preferred:

> In our internal Gauntlet G1 benchmark, VulnGPT reproduced a raw 39/51 matrix with 0 false positives. After documented exclusions for out-of-scope, invalid-ground-truth, and structurally unobservable rows, the adjudicated valid-in-scope score was 41/42 with 0 valid-in-scope misses remaining. This is our own benchmark, not third-party audited.

Short form:

> Gauntlet G1 (internal, frozen): raw 39/51, 0 false positives; adjudicated valid-in-scope 41/42.

Do **not** say: "VulnGPT detects 97.6% of real-world vulnerabilities"; "VulnGPT has zero false positives" as a universal claim; "certified" without the internal/self-run qualifier in the same sentence; "41/42 planted vulnerabilities were confirmed" without the adjudicated-score qualifier; "51/51" or any equivalent manufactured perfect score; "AI replaces pentesters."

## Versioning

This is the **v1.5** result; it supersedes v1.2–v1.4, whose scores it improved on through the reliability fixes described above (the v1.2 adjudication itself still stands for the rows it covered). A future G2 benchmark, if and when it is genuinely executed and frozen, will be published separately — it will never silently replace this result's denominators or conditions.
