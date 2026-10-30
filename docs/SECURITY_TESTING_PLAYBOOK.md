# Contextual Application Security Testing Playbook

## Purpose

This playbook is a practical reference for planning authorized tests of application behavior that depends on identity, permissions, object ownership, workflow state, or sequences of actions.

It is a testing-design guide, not a statement that every listed scenario is supported or automatically detected by VulnGPT. The product is in private beta; confirm the exact workflows available for a proposed evaluation.

## 1. Define the assessment boundary

Before designing a test, record:

- the system owner and written authorization;
- the exact hosts, APIs, applications, and environments in scope;
- permitted test identities and their roles;
- the test window and operational contact;
- allowed state-changing actions and prohibited operations;
- data categories that may be accessed;
- rate, concurrency, and safety constraints;
- stop conditions and incident escalation path.

Do not use public reachability as a substitute for authorization. Prefer a staging environment and synthetic records.

## 2. Write the security invariant first

A security invariant is a rule that should remain true across relevant users, objects, and state transitions.

Examples:

- A user cannot read a private object owned by a different tenant.
- A role without approval authority cannot approve a restricted workflow.
- A transaction cannot be finalized before its required preconditions are satisfied.
- A session whose privilege has been revoked cannot continue to perform the revoked action.
- Replaying an action cannot grant an additional benefit beyond the application's intended semantics.

Write the rule in language that the application owner can validate. Avoid a vague objective such as "test IDOR" without identifying the protected resource and expected boundary.

## 3. Choose a controlled comparison

A useful comparison changes one important variable while keeping other relevant conditions stable.

| Variable | Example comparison | What it helps isolate |
| --- | --- | --- |
| Actor | User A vs User B | Identity-dependent behavior |
| Role | Viewer vs administrator | Privilege enforcement |
| Tenant | Tenant A vs Tenant B | Tenant isolation |
| Ownership | Owner vs non-owner | Object-level authorization |
| Session | Current vs expired or revoked session | Session lifecycle enforcement |
| Workflow state | Eligible vs ineligible state | Transition preconditions |
| Sequence | Valid order vs prohibited order | Business-rule enforcement |

Record any variable that cannot be held constant. A difference between two requests is not meaningful unless the comparison is understood.

## 4. Test patterns

### A. Object ownership and cross-user access

**Invariant:** An authenticated actor may access only objects permitted by the application's authorization policy.

**Preparation:** Create two authorized test identities and separate synthetic objects. Record the expected owner and tenant for each object.

**Comparison:** Establish the normal owner-access path, then examine the same resource boundary under the second identity using only permitted test actions.

**Evidence to capture:** actor identity, object ownership, relevant scope, actual protected data or persisted side effect, and a control request.

**Insufficient by itself:** an identifier is accepted, a request returns HTTP 200, or response length differs.

### B. Role and privilege boundaries

**Invariant:** Sensitive actions require the appropriate server-enforced permission.

**Preparation:** Define the expected permission matrix for the test roles. Use test identities with deliberately different privileges.

**Comparison:** Exercise a permitted control action, then evaluate the restricted action under the lower-privileged identity.

**Evidence to capture:** effective role, action, target object, server-observed outcome, and any resulting state change.

**Insufficient by itself:** a hidden UI element, a visible button, or a generic success response without a demonstrated protected effect.

### C. Workflow preconditions and state transitions

**Invariant:** A workflow transition is accepted only when its required preconditions are satisfied.

**Preparation:** Document the expected states, allowed transitions, and required approvals or prerequisites.

**Comparison:** Record a valid transition path and compare it with a controlled attempt made from a state where the prerequisite is absent.

**Evidence to capture:** initial state, actor, action sequence, prerequisite status, resulting state, and any externally visible side effect.

**Insufficient by itself:** an endpoint accepts input without confirming that a protected transition actually occurred.

### D. Multi-step business logic

**Invariant:** Combining individually valid actions must not bypass a business rule.

**Preparation:** Select a synthetic workflow with a clear rule—for example eligibility, quantity, entitlement, approval, or ownership.

**Comparison:** Establish the expected outcome through the normal path, then evaluate a bounded alternate sequence that tests the same rule.

**Evidence to capture:** relevant records, sequence order, rule preconditions, final state, and any benefit or entitlement granted.

**Insufficient by itself:** a pricing or display difference without evidence that the application's authoritative state or entitlement changed.

### E. Session and authentication lifecycle

**Invariant:** Access decisions remain correct as authentication and privilege state changes.

**Preparation:** Use dedicated test sessions and record the expected login, logout, expiry, and revocation behavior.

**Comparison:** Compare a valid session with a session that has been deliberately expired, logged out, or revoked according to the approved test plan.

**Evidence to capture:** session state, actor identity, action, response, and any protected state change.

**Insufficient by itself:** a browser redirect or client-side message without examining the protected operation's outcome.

### F. Interference and ambiguous outcomes

**Invariant:** A conclusion must reflect application behavior, not an unexamined intermediary or transient failure.

**Preparation:** Identify known rate limits, WAFs, proxies, asynchronous jobs, caches, and expected session timeouts.

**Comparison:** Use safe control requests and repeat only within the agreed operational envelope.

**Evidence to capture:** timestamps, request context, intermediary behavior where observable, application state, and repeatability.

**Insufficient by itself:** a WAF block, timeout, 429 response, or intermittent error.

## 5. Evidence record

For each hypothesis, capture the minimum evidence needed for independent review:

1. The authorized target and test window.
2. The security invariant.
3. The actors, roles, tenants, sessions, and objects involved.
4. Preconditions and relevant prior actions.
5. The controlled intervention.
6. The observed response and authoritative state change, where available.
7. The control comparison.
8. Plausible alternative explanations considered.
9. Reproduction conditions and limitations.
10. Impact supported by the observation.

Redact credentials, tokens, personal data, and unrelated records. Do not store unnecessary request or response bodies.

## 6. Adjudicate conservatively

Use bounded conclusions:

- **Confirmed:** direct, relevant evidence supports the stated security violation.
- **Needs further validation:** the hypothesis is plausible but alternative explanations or missing evidence remain.
- **Not reproduced:** the expected violation was not observed under the documented conditions; this does not prove universal absence.
- **Out of scope / not evaluated:** authorization, safety, environment, or available evidence did not permit a meaningful test.

Do not turn an inconclusive result into a positive finding or a negative guarantee.

## 7. Close the loop

After a finding is reviewed:

- agree on the remediation owner and expected security behavior;
- retain the original invariant and test context;
- retest the same boundary in an approved environment;
- check for regressions in nearby roles and workflow states;
- document changed conditions that affect comparability;
- close only when the evidence supports the remediation decision.

## Related resources

- [Capability Evaluation Matrix](CAPABILITY_EVALUATION_MATRIX.md)
- [Assessment Plan Template](ASSESSMENT_PLAN_TEMPLATE.md)
- [Finding Report Standard](FINDING_REPORT_STANDARD.md)
- [Evidence and Validation](EVIDENCE_AND_VALIDATION.md)
- [Responsible Testing](RESPONSIBLE_TESTING.md)
