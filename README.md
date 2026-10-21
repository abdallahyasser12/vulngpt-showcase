# VulnGPT — Public Showcase Source

> Evidence-first AI-assisted web application security testing by **NovaSecLabs**.

VulnGPT is being built to go beyond surface-level payload scanning by reasoning across authenticated state, users and roles, authorization boundaries, object ownership, multi-step workflows, business logic, interference, and reproducible validation.

This directory is the **public-safe source package** for a future standalone public GitHub showcase repository. It intentionally excludes proprietary engine code, secrets, deployment internals, private customer data, and benchmark implementation details that would compromise measurement integrity.

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

## Gauntlet G1 — certified freeze

**Freeze date:** 2026-09-20

| Measure | Result |
| --- | ---: |
| Raw historical matrix | **39 / 51** |
| False-positive sum across the 13-environment matrix | **0** |
| Adjudicated valid-in-scope score | **41 / 42** |
| Valid-in-scope misses remaining | **0** |

The adjudicated denominator is documented as 51 minus 2 explicitly out-of-scope rows, 3 invalid-ground-truth rows, and 4 structurally unobservable rows.

These are **controlled internal benchmark results**, obtained in the repository's defined Gauntlet G1 conditions. They are not a claim that VulnGPT detects 97.6% of vulnerabilities in arbitrary real-world applications, nor a claim that false positives are impossible outside the benchmark.

See [BENCHMARK_G1.md](BENCHMARK_G1.md) for the exact interpretation and limitations.

## Links

- Website: https://www.novaseclabs.com
- Private beta: https://www.novaseclabs.com/waitlist

## Authorized use only

VulnGPT is intended for systems the operator owns or is explicitly authorized to test. Public marketing must never encourage testing unrelated third-party systems without permission.
