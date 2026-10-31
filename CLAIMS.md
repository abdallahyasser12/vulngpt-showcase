# Claims and Messaging Standard

This document is the source of truth for public product language in this repository. Its purpose is to keep the website, README, partner material, and public documentation aligned with the evidence actually available for publication.

## Approved product description

> VulnGPT is an autonomous web application security testing product by NovaSecLabs, currently in private beta and being developed to investigate application behavior across authenticated identities, authorization boundaries, object ownership, state transitions, and business logic, with an emphasis on evidence-oriented validation.

Short description:

> Evidence-oriented autonomous web application security testing for complex application behavior.

Always pair the product name with its maker on first mention ("VulnGPT by NovaSecLabs"). Other, unrelated projects share the name VulnGPT.

### Autonomy language

VulnGPT is described as **autonomous** (founder decision, 2026-10-30). This replaces "AI-assisted" wherever the phrase described VulnGPT itself. The meaning is fixed and must travel with the word:

> Autonomous means VulnGPT plans and runs the test steps itself inside the target, scope, and runtime budget you authorize; it does not mean unsupervised: you verify the target, set scope, confirm authorization, and review the evidence.

Allowed phrases:

- "autonomous web application security testing" and "autonomous penetration tests";
- "plans and runs the test steps itself inside the scope you authorize";
- "autonomous, within the target, scope, and runtime budget you set";
- "you verify the target, set scope, confirm authorization, and review the evidence".

Banned phrases (they claim more than the definition supports):

- "fully autonomous";
- "hands-free";
- "replaces pentesters" (or any wording that replaces human testers or reviewers);
- "no human needed" (or "no human required", "set and forget").

"AI-assisted" may still describe the product category or other tools, but never VulnGPT itself. Every limit elsewhere in this document still applies: autonomy does not change what may be claimed about detection rates, certifications, availability, or customers.

## Safe capability language

Use qualified language such as:

- "is being developed to investigate";
- "is designed to reason about";
- "the product focus includes";
- "the current private-beta evaluation can be used to assess";
- "availability should be confirmed for the proposed workflow."

When describing a capability as currently available, cite a current product artifact or obtain explicit product-owner confirmation.

## Product status language

The approved public status is **private beta**. Do not describe VulnGPT as generally available, production-certified, independently audited, or universally compatible unless that status changes and suitable evidence is approved for publication.

## Evidence and performance claims

Do not publish a detection rate, false-positive rate, benchmark score, comparative ranking, or coverage percentage unless the supporting record includes:

- a defined benchmark and version;
- frozen or otherwise controlled ground truth;
- explicit inclusion and exclusion rules;
- run conditions and environment details;
- scoring and adjudication rules;
- reproducibility evidence;
- limitations and conflicts of interest;
- approval of the exact public wording.

Internal testing is not independent certification. Results from a self-developed benchmark must be described as internal and scoped to its documented conditions.

### Current G1 publication decision

The previous public G1 explanation contained arithmetic that did not reconcile across the headline, adjudication explanation, and row counts. The figures are not approved for use in marketing or as product-wide performance claims while that issue remains unresolved. See [BENCHMARK_G1.md](BENCHMARK_G1.md).

Do not claim:

- "zero false positives" as a universal product property;
- a guaranteed real-world detection rate;
- "certified" or "independently verified" without the relevant independent artifact;
- that VulnGPT detects every vulnerability;
- that VulnGPT replaces penetration testers or runs without human supervision;
- customer adoption, endorsements, or outcomes that have not been approved and substantiated.

## Security, privacy, and compliance claims

Do not claim SOC 2, ISO 27001, GDPR compliance, data residency, encryption specifications, retention periods, SSO support, or other security controls unless current evidence and applicable contractual scope have been reviewed and approved.

Use [Security and Privacy](docs/SECURITY_AND_PRIVACY.md) and [Enterprise Evaluation](docs/ENTERPRISE_EVALUATION.md) to frame questions that require direct confirmation. A questionnaire is not evidence that a control exists.

## Tone and editorial standard

Prefer:

- specific descriptions of the problem and test context;
- observable behavior over marketing adjectives;
- explicit scope, limits, and uncertainty;
- clear distinctions between current availability and product direction;
- terminology that a security practitioner and a developer can both understand.

Avoid "revolutionary", "unbeatable", "perfect", "guaranteed", "military-grade", "zero false positives", and similar unbounded claims.

## Review requirement

Any public change that adds product capabilities, performance figures, customer references, certifications, privacy assurances, or security guarantees must be reviewed against supporting evidence before publication.
