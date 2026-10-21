# Gauntlet G1 — Public Benchmark Interpretation

This page defines the marketing-safe interpretation of the certified **Gauntlet G1 v1.5 freeze** so public claims remain aligned with repository evidence.

## Certified result

The repository's G1 v1.5 freeze certificate records:

- **RAW HISTORICAL: 39 / 51**
- **fp_sum = 0**
- **ADJUDICATED VALID-IN-SCOPE: 41 / 42**
- **0 VALID_IN_SCOPE_MISS remain**
- 13 benchmark environments
- every environment recorded `false_positive_count = 0`
- the 39/51 raw matrix was reproduced twice after the documented reliability fixes

## Why 39/51 and 41/42 are both shown

They measure different things.

The raw matrix preserves all 51 historical ground-truth rows. The freeze certificate documents 11 non-pass rows that include out-of-scope, invalid-ground-truth, wrong-taxonomy, and structurally unobservable cases.

The adjudicated valid-in-scope denominator is:

`51 - 2 out-of-scope - 3 invalid-GT - 4 structurally unobservable = 42`

The certificate records **41/42 valid-in-scope** and **0 valid-in-scope misses remaining**. The remaining distinction is tied to taxonomy/adjudication rather than an undisclosed conversion of the raw score into 51/51.

## Benchmark conditions

The freeze certificate identifies the run conditions as:

- sandbox profile;
- honest-mode enabled;
- offline / no LLM;
- clean-first per-run engine directory;
- 1200-second wallclock cap per environment;
- frozen benchmark substrate and ground truth.

These conditions matter. Public materials must not generalize this controlled result into an arbitrary production detection rate.

## Approved public wording

Preferred:

> In the certified Gauntlet G1 freeze, VulnGPT reproduced a raw 39/51 matrix with fp_sum=0. After documented exclusions for out-of-scope, invalid-ground-truth, and structurally unobservable rows, the adjudicated valid-in-scope score was 41/42 with 0 valid-in-scope misses remaining.

Short form:

> Gauntlet G1 certified freeze: raw 39/51, fp_sum=0; adjudicated valid-in-scope 41/42 with 0 valid-in-scope misses.

## Wording to avoid

Do **not** say:

- "VulnGPT detects 97.6% of real-world vulnerabilities."
- "VulnGPT has zero false positives."
- "41/42 planted vulnerabilities were confirmed" without explaining that 41/42 is the adjudicated valid-in-scope score.
- "51/51" or any equivalent manufactured perfect score.
- "AI replaces pentesters."

## Evidence authority

The authoritative source remains the repository's frozen G1 v1.5 certificate. If future benchmark evidence supersedes G1, public copy should preserve the historical G1 result and identify the newer benchmark separately rather than silently replacing denominators or conditions.
