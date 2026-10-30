# Evidence and Validation Standard

## Purpose

This document defines the evidence principles behind VulnGPT's public product positioning. It explains what a defensible application-security result should communicate and why a raw signal should not automatically become a confirmed finding.

It is a public methodology statement, not a claim that every stage is fully automated or available for every vulnerability class in the current private beta.

## The central rule

**A finding should be supported by observable behavior that violates a stated security expectation under a known, authorized test context.**

An interesting response may justify investigation. It does not, by itself, establish impact, exploitability, or root cause.

## Minimum evidence record

A reviewer should be able to understand the following elements.

| Element | Required question |
| --- | --- |
| Authorization | Was this target, identity, action, and test window explicitly authorized? |
| Security expectation | What rule or boundary should the application enforce? |
| Actor context | Which user, role, tenant, session, or privilege level performed the action? |
| Resource context | Which object or workflow was involved, and who was entitled to access it? |
| Preconditions | What state and prior actions were necessary for the test? |
| Intervention | What controlled action was performed, and what variable changed? |
| Observation | What data, state change, or side effect was actually observed? |
| Control | What comparison helps rule out an unrelated explanation? |
| Reproducibility | Can an authorized reviewer repeat the test safely? |
| Impact | What security consequence follows from the demonstrated behavior? |
| Limitations | What remains uncertain, environment-specific, or unverified? |

Do not include credentials, live session tokens, unrelated customer records, or secrets in public reports.

## Evidence quality

### Direct evidence

An observable result that directly supports the security claim, such as a test actor retrieving private data belonging to a separate test actor where the application's access rule prohibits it.

### Comparative evidence

A controlled comparison showing that the result changes with one relevant variable, such as actor identity, role, object ownership, or workflow state.

### Supporting evidence

Context that helps interpret the result, such as a request sequence, state transition, application response, or relevant authorization expectation.

### Ambiguous evidence

An observation with plausible alternative explanations that have not been ruled out. It should remain an open hypothesis or an explicitly qualified result—not be promoted beyond what the evidence supports.

## Controlled comparison

Where feasible and safe, compare:

1. a permitted control action under the expected identity and state;
2. the test action under the identity or state being evaluated;
3. the resulting data, state, and side effects;
4. a repeat of the comparison to check stability.

Avoid changing several variables simultaneously unless the workflow requires it and the resulting limitations are documented.

## Common sources of false conclusions

| Observation | Why it is insufficient on its own |
| --- | --- |
| HTTP 200 response | The body may contain no protected information or state change |
| HTTP 403 response | One blocked request does not establish that all relevant authorization paths are protected |
| Different response length | Caching, personalization, dynamic fields, or error handling can cause differences |
| WAF challenge or block | It may reflect an intermediary control rather than the application's underlying authorization logic |
| Timeout | It may be environmental, rate-related, or transient |
| State mismatch | It may result from asynchronous processing, stale reads, or an incomplete workflow |
| Unexpected object identifier | An identifier being accepted does not prove unauthorized access or impact |

## Bounded conclusions

Reports should separate what was observed from what is inferred. A useful report distinguishes:

- the behavior directly demonstrated;
- the security expectation it violates;
- the impact supported by the evidence;
- the assumptions and limitations;
- any remaining uncertainty.

Avoid universal statements when the test covers only one actor, object, endpoint, state, or environment.

## Retesting

A retest should preserve the original security expectation and the conditions necessary to exercise it. The reviewer should compare the original and updated behavior, verify that the attempted remediation did not introduce a different failure, and record any environmental or workflow changes that affect comparability.

A changed response status alone is not sufficient to demonstrate remediation.

## Public performance claims

Detection rates, false-positive rates, benchmark scores, and comparisons require a documented dataset, ground truth, scope, run conditions, scoring rules, and limitations. Internal testing is not independent certification. A result should not be generalized beyond the environments and conditions it actually measures.

The current public benchmark publication status is described in [BENCHMARK_G1.md](../BENCHMARK_G1.md). No unresolved or unreconciled score should be used as a marketing claim.

## Related documents

- [Technical Approach](TECHNICAL_APPROACH.md)
- [Responsible Testing](RESPONSIBLE_TESTING.md)
- [Claims and Messaging](../CLAIMS.md)
