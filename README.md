# VulnGPT — Public Showcase

![VulnGPT — evidence-first AI-assisted web application security testing](assets/social-preview.png)

> Evidence-first AI-assisted web application security testing by **NovaSecLabs**.

VulnGPT is being built to go beyond surface-level payload scanning by reasoning across authenticated state, users and roles, authorization boundaries, object ownership, multi-step workflows, business logic, interference, and reproducible validation.

This is the public-safe showcase for VulnGPT. It intentionally excludes proprietary engine code, secrets, deployment internals, private customer data, and benchmark implementation details that would compromise measurement integrity — the engine itself stays in a private repository.

## What makes VulnGPT different

### Evidence before alert volume
A suspicious response is a hypothesis, not automatically a vulnerability. VulnGPT is engineered to keep discovery, hypothesis generation, validation, and confirmation distinct so unsupported signals do not become customer findings.

### Stateful authenticated testing
The engine is designed around session continuity, actor identity, role context, object ownership, and application state rather than treating every request as an isolated payload opportunity.

### Authorization and business logic
Key engineering areas include BOLA/IDOR-style authorization boundaries, multi-role behavior, business-logic workflows, state transitions, and other classes where simple pattern matching is insufficient.

### Interference-aware validation
WAF behavior, throttling, session expiry, changing application state, and other sources of ambiguity are treated as evidence-quality problems rather than automatically as proof of vulnerability.

### Reproducible findings and retesting
The product direction is discovery → hypothesis → controlled validation → evidence → finding → retest, with the goal of reducing the amount of manual false-positive triage imposed on security teams.

## Gauntlet G1 — our internal benchmark result

**Frozen:** 2026-09-20. This is a benchmark we built, ran, and scored ourselves — not third-party audited, and not reproduced independently yet. We're publishing the methodology precisely so that can change.

| Measure | Result |
| --- | ---: |
| Raw historical matrix | **39 / 51** |
| False-positive sum across the 13-environment matrix | **0** |
| Adjudicated valid-in-scope score | **41 / 42** |
| Valid-in-scope misses remaining | **0** |

The adjudicated denominator is documented as 51 minus 2 explicitly out-of-scope rows, 3 invalid-ground-truth rows, and 4 structurally unobservable rows — 12 non-pass rows total, each named individually in BENCHMARK_G1.md, none of them a detection miss.

These are **controlled internal benchmark results**. They are not a claim that VulnGPT detects 97.6% of vulnerabilities in arbitrary real-world applications, nor a claim that false positives are impossible outside the benchmark.

See [BENCHMARK_G1.md](BENCHMARK_G1.md) for the full methodology, per-environment scores, and limitations.

## Assets

`assets/` holds the real files behind this README's header image and the brand mascot: `social-preview.png` (the banner above), `mascot-confident.png` (transparent cutout, background-removed and AI-upscaled from the reference sheet — not redrawn), `mascot-reference-sheet.jpg` (the full source sheet), and real captures of the live site (`site-home.png`, `site-waitlist.png`).

## Links

- Website: https://www.novaseclabs.com
- Private beta: https://www.novaseclabs.com/waitlist

## Authorized use only

VulnGPT is intended for systems the operator owns or is explicitly authorized to test. Public marketing must never encourage testing unrelated third-party systems without permission.
