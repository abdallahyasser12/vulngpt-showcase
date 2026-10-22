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

## Benchmark publication status

The internal G1 v1.5 freeze certificate records a raw matrix of **39 / 51** and a false-positive sum of **0** under its documented controlled conditions. The same certificate records an adjudicated **41 / 42** score and **0 valid-in-scope misses**, but the public explanation currently contains an arithmetic inconsistency: it describes 39 exact-category passes plus 3 wrong-taxonomy credits (42 total) while reporting 41 / 42.

We are preserving the historical record and reconciling the public score explanation against the frozen row-level scoring evidence. Until that reconciliation is complete, **do not use the 41 / 42 or zero-miss figures as public performance claims**. These are internal, self-run benchmark materials, not third-party audited results.

See [BENCHMARK_G1.md](BENCHMARK_G1.md) for the publication caveat and methodology context.

## Assets

`assets/` holds the real files behind this README's header image and the brand mascot: `social-preview.png` (the banner above), `mascot-confident.png` (transparent cutout, background-removed and AI-upscaled from the reference sheet — not redrawn), `mascot-reference-sheet.jpg` (the full source sheet), and real captures of the live site (`site-home.png`, `site-waitlist.png`).

## Links

- Showcase: https://vulngpt-showcase.vercel.app/
- Website: https://www.novaseclabs.com
- Private beta: https://www.novaseclabs.com/waitlist

## Authorized use only

VulnGPT is intended for systems the operator owns or is explicitly authorized to test. Public marketing must never encourage testing unrelated third-party systems without permission.
