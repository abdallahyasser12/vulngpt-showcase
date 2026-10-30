# Capability Evaluation Matrix

## How to read this matrix

This document helps evaluators select representative application-security scenarios for a VulnGPT assessment.

**It is not a product support matrix, feature-completion report, detection guarantee, or statement that every row is currently available in the private beta.** The rows describe areas of investigation and the evidence an evaluator should look for. Confirm the exact scope and supported workflows with NovaSecLabs before an evaluation.

## Evaluation dimensions

| Area | Representative test question | Context required | Evidence expected | Common false conclusion |
| --- | --- | --- | --- | --- |
| Object-level authorization | Can an actor access another actor's protected object? | Actor, owner, tenant, object | Protected data or unauthorized persisted effect | HTTP 200 means access succeeded |
| Role enforcement | Can a lower-privileged role perform a restricted action? | Effective role, permissions, action | Demonstrated unauthorized operation or state change | UI visibility proves authorization |
| Tenant isolation | Can one tenant cross a data or operation boundary? | Distinct test tenants and objects | Direct cross-tenant disclosure or mutation | Similar response shapes imply leakage |
| Authenticated workflow | Does access depend on session history or prior actions? | Session, actor, sequence | Reproducible difference tied to session state | Redirect or timeout proves enforcement |
| State transition | Can an invalid transition be completed? | Initial state, allowed transitions | Authoritative state or side effect | Endpoint accepted request, so transition occurred |
| Business invariant | Can valid actions be combined to bypass a domain rule? | Rule, records, sequence, expected result | Demonstrated rule violation and impact | Display-only inconsistency proves business impact |
| Replay and duplication | Can repeating an operation violate intended semantics? | Idempotency expectation, transaction identity | Duplicate protected effect or entitlement | Duplicate HTTP responses imply duplicate processing |
| Session lifecycle | Does logout, expiry, or revocation remove access? | Session and revocation state | Protected operation remains blocked after invalidation | Client-side logout alone proves server invalidation |
| Interference | Is an apparent result caused by WAF, throttling, or transient behavior? | Proxy path, timing, rate and control requests | Evidence separating intermediary from application behavior | Block page proves application is secure |

## Selecting a representative test set

An evaluation should balance:

- **Positive cases:** controlled scenarios where a known policy violation is deliberately present.
- **Negative cases:** similar-looking scenarios where access or behavior is expected and legitimate.
- **Boundary cases:** cases that differ by one actor, role, tenant, ownership, or state variable.
- **Ambiguous cases:** scenarios with known environmental interference or incomplete observability.
- **Retest cases:** scenarios where a documented remediation should restore the invariant.

Where practical, use a deliberately vulnerable test fixture or independently reviewed ground truth. Do not use customer production data to create a benchmark.

## Suggested evaluation worksheet

For each row selected, record:

| Field | Value |
| --- | --- |
| Scenario ID | Customer-defined identifier |
| Application and environment | Authorized target |
| Security invariant | Expected rule |
| Test identities | Approved actors and roles |
| Test objects | Synthetic or approved records |
| Ground truth | Expected vulnerable or secure behavior |
| Preconditions | Required application state |
| Allowed actions | Approved test operations |
| Evidence required | Observable criteria |
| Result | Confirmed / not reproduced / ambiguous / not evaluated |
| Limitations | Unobserved behavior and environmental constraints |
| Reviewer | Responsible human adjudicator |

## Interpreting results

Do not collapse different outcomes into one aggregate score without an explicit scoring policy.

Keep separate:

- scenario execution completion;
- scenario observability;
- correct identification of known positive cases;
- correct handling of known negative cases;
- evidence sufficiency;
- adjudication outcome;
- operational safety.

A scenario that was not reached or could not be observed is not equivalent to a scenario that was tested and correctly rejected. An inconclusive test is not a clean negative.

## Related resources

- [Security Testing Playbook](SECURITY_TESTING_PLAYBOOK.md)
- [Benchmark Governance](BENCHMARK_GOVERNANCE.md)
- [Enterprise Evaluation](ENTERPRISE_EVALUATION.md)
