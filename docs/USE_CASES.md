# Application Security Use Cases

The scenarios below describe the kinds of application behavior that motivate VulnGPT's product direction. They are illustrative test patterns, not claims that every scenario is currently supported or automatically detected in the private beta.

All testing must use an owned or explicitly authorized application, approved identities, and safe test data.

## 1. Cross-user object access

**Scenario:** Two test users have separate records. A request made by one user references an object owned by the other.

**Security invariant:** A user must only read or modify objects permitted by the application's authorization policy.

**What to examine:** authenticated identity, object ownership, tenant or organization context, server-side authorization, actual data returned, and any state change.

**Weak evidence:** an object identifier is accepted, a request returns HTTP 200, or response length changes.

**Stronger evidence:** protected data or an unauthorized state change is directly observed under the test actor, with an appropriate control comparison.

## 2. Role-boundary violations

**Scenario:** A lower-privileged test role attempts an action reserved for a higher-privileged role.

**Security invariant:** The operation must be authorized by the server for the actor's effective permissions, not merely by the visibility of a user-interface control.

**What to examine:** role assignments, endpoint-level checks, workflow state, response contents, and persisted side effects.

**Weak evidence:** an administrative button is visible or an endpoint returns a generic success response.

**Stronger evidence:** the lower-privileged actor performs a restricted operation and the unauthorized effect is verifiably persisted.

## 3. Multi-step business logic

**Scenario:** A workflow contains prerequisites such as eligibility, approval, payment, or ownership before a later action should be accepted.

**Security invariant:** The application must enforce the required sequence and preconditions on the server.

**What to examine:** the initial state, required transition, attempted out-of-order action, resulting state, and control path.

**Weak evidence:** a workflow endpoint accepts a request but no protected transition occurs.

**Stronger evidence:** the protected state changes or a restricted benefit is granted despite a required precondition not being met.

## 4. Tenant isolation

**Scenario:** Users in different organizations interact with records or shared application services.

**Security invariant:** Tenant-scoped data and operations remain inside the permitted organization boundary.

**What to examine:** tenant context, object ownership, list and search behavior, direct object access, exports, and background workflows.

Use dedicated test tenants and synthetic records. Avoid using another customer's production data.

## 5. Session and state transitions

**Scenario:** A user's permissions or workflow state changes during a sequence of actions.

**Security invariant:** Authentication and authorization decisions remain correct after session renewal, privilege changes, logout, expiry, or a relevant state transition.

**What to examine:** identity continuity, session lifecycle, authorization freshness, cached context, and state consistency.

**Alternative explanations:** stale caches, asynchronous processing, and expected session expiry can produce misleading observations.

## 6. Interference and ambiguous outcomes

**Scenario:** A test is affected by rate limiting, a WAF, intermittent network behavior, or application state changing between requests.

**Security invariant:** Conclusions should be based on application behavior that the evidence actually supports.

**What to examine:** timing, repeatability, control requests, intermediary responses, application-side state, and test-environment stability.

An intermediary block or timeout should not automatically be presented as evidence of an application vulnerability.

## Designing a useful evaluation

For each selected use case, agree on:

- the exact application and environment;
- the written authorization and test window;
- the test identities and expected permissions;
- the records and workflow states to be used;
- the security invariant under examination;
- safe and prohibited test actions;
- the evidence required for a successful evaluation;
- the independent review or ground-truth process.

A good proof of value measures evidence quality and practical usefulness—not simply the number of alerts produced.

## Related documents

- [Technical Approach](TECHNICAL_APPROACH.md)
- [Evidence and Validation](EVIDENCE_AND_VALIDATION.md)
- [Responsible Testing](RESPONSIBLE_TESTING.md)
