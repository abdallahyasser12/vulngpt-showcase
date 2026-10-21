# VulnGPT — Claims & Messaging

This page states what we say publicly about VulnGPT, and why, so claims stay aligned with actual repository evidence.

## Core positioning

> VulnGPT is designed to reason across authenticated state, users and roles, authorization boundaries, object ownership, multi-step workflows, and business logic — then validate evidence before promoting a finding.

## What we discuss, and how

We use qualified language — "designed to", "engineered around", "current focus includes" — unless a capability has a specific production acceptance artifact behind it:

- authenticated application testing and session continuity
- multi-user / multi-role authorization analysis
- BOLA / IDOR and object-ownership reasoning
- business-logic and multi-step workflow analysis
- application-state and temporal reasoning
- WAF / interference-aware validation
- evidence-backed confirmation
- retesting and finding lifecycle

## False-positive positioning

Preferred: "We optimize for defensible confirmation, not maximum alert count."

Benchmark-supported: "In the certified G1 controlled benchmark matrix, fp_sum was 0 across all 13 environments."

We never turn that benchmark-specific result into "VulnGPT has zero false positives" as a universal claim.

## Benchmark positioning

> Raw 39/51, fp_sum=0; adjudicated valid-in-scope 41/42, with 0 valid-in-scope misses remaining under G1's documented conditions.

The raw and adjudicated numbers are shown together on purpose — see [BENCHMARK_G1.md](BENCHMARK_G1.md).

## Tone

Technical, transparent, specific, measurable. We avoid "revolutionary", "unbeatable", "perfect", "fully replaces", "guaranteed", and "zero false positives" outside a clearly bounded benchmark statement.

## Private beta

VulnGPT is in private beta. Current public plan details (credits, seats, targets, retention) are published on [novaseclabs.com/pricing](https://www.novaseclabs.com/pricing); onboarding today runs through the [private beta application](https://www.novaseclabs.com/waitlist) rather than self-serve checkout.
