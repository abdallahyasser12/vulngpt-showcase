# Application Security Glossary

This glossary explains terms used throughout the VulnGPT public documentation. Definitions are intentionally practical and scoped to application-security testing.

| Term | Meaning |
| --- | --- |
| Actor | A user, service, or identity performing an application action. |
| Authorization | The decision about whether an authenticated or identified actor may perform a particular action on a resource. |
| Authentication | The process of establishing or verifying an identity. |
| BOLA | Broken Object Level Authorization: an access-control failure in which an actor can access an object they should not be permitted to access. |
| Business logic flaw | A weakness in the rules, assumptions, or workflow constraints governing application operations. |
| Control case | A known-good comparison used to interpret a test result. |
| Evidence | Observable information that supports or weakens a security hypothesis. |
| Falsification | Testing an alternative explanation or attempting to disprove a hypothesis rather than only seeking confirmation. |
| Ground truth | A documented expected result for a test scenario, established independently of the system's result being evaluated. |
| Hypothesis | A specific, testable statement about a possible security failure. |
| IDOR | Insecure Direct Object Reference: a common pattern associated with object-level authorization failures, where changing or supplying a reference can expose an access-control weakness. |
| Invariant | A security or business rule that should remain true across relevant actors, objects, actions, and state transitions. |
| Multi-actor testing | A test design that compares behavior across multiple authorized identities or roles. |
| Object ownership | The user, tenant, or business entity to which an application resource belongs. |
| Retest | A follow-up assessment of the same security expectation after a proposed remediation. |
| Session | The application context that associates multiple requests with an authenticated or otherwise identified actor. |
| State transition | A change from one application or workflow state to another. |
| Tenant isolation | The separation of data and operations belonging to different customer organizations or tenants. |
| WAF | Web Application Firewall: an intermediary security control that inspects or filters application traffic. A WAF response is not, by itself, proof of the application's underlying security behavior. |

## Related documents

- [Technical Approach](TECHNICAL_APPROACH.md)
- [Security Testing Playbook](SECURITY_TESTING_PLAYBOOK.md)
- [Evidence and Validation](EVIDENCE_AND_VALIDATION.md)
