# VulnGPT — Product Overview

**Product:** VulnGPT  
**Company:** NovaSecLabs  
**Status:** Private beta  
**Category:** AI-assisted web application security testing

## Executive summary

VulnGPT is being developed to investigate web application security weaknesses that depend on behavior across identities, permissions, objects, sessions, and multi-step workflows.

Its central product premise is straightforward: a suspicious request or response is not enough to establish a vulnerability. The application context must be understood, a security expectation must be made explicit, and the observed behavior must be tested against that expectation.

The product direction combines contextual investigation with evidence-oriented validation. It is intended to support security practitioners and application builders—not to claim that automated testing can replace expert judgment.

## The problem

Modern web applications are systems of relationships and state.

A user action may depend on a previously established session. An API object may belong to a different tenant. A workflow may permit an action only after an approval or payment transition. A role may be allowed to view a record but not modify it. A request may appear successful while the application's underlying state remains unchanged.

When testing treats requests as isolated payload opportunities, it can miss failures that depend on these relationships. Conversely, a scanner may observe unusual behavior and overstate what that behavior proves.

The difficult work is to answer questions such as:

- Which identity performed the action?
- What role and permissions did that identity have at the time?
- Which user or tenant owned the target object?
- What was the application's state before and after the action?
- What security invariant should have held?
- Could caching, session expiry, throttling, WAF behavior, or another condition explain the observation?
- Can the result be reproduced safely and reviewed by another person?

## Product direction

VulnGPT is designed to focus on the following investigation areas:

### Authorization and object ownership

Investigate whether an authenticated actor can read, change, or otherwise affect an object outside the actor's permitted ownership or access boundary. This includes BOLA/IDOR-style scenarios and authorization differences between users or roles.

### Authenticated and multi-actor workflows

Preserve the significance of actor identity and session context across sequences of actions. Some access-control failures only become visible when behavior is compared between two or more appropriately configured test identities.

### Business logic and workflow integrity

Examine whether the application enforces important rules across related actions: eligibility, approval, quantity, ownership, sequencing, account state, or other domain invariants.

### Stateful application behavior

Consider transitions between states, the ordering of operations, and whether a later action is permitted only after a required earlier event.

### Interference-aware interpretation

Treat WAF responses, rate limits, transient failures, session expiry, caching, and environmental changes as possible alternative explanations. Such behavior should not automatically be described as proof of an application vulnerability.

These areas describe the product's focus. They are not a guarantee of universal coverage, support for every application architecture, or availability of every workflow in the current private beta.

## Intended users

| User | Intended value |
| --- | --- |
| Penetration testers | Investigate contextual authorization and business-logic weaknesses with evidence that can be reviewed |
| Application security teams | Add another investigative approach to existing security testing and triage practices |
| Product security engineers | Examine security invariants across identities, records, and state transitions |
| Developers and technical founders | Understand security behavior in the workflows they build and maintain |

## Product principles

1. **Context over isolated observations.** Identity, role, ownership, and state are part of the security question.
2. **Hypotheses over assumptions.** A suspected issue should be expressed as a testable claim.
3. **Falsification over confirmation bias.** A sound investigation considers alternative explanations and controls.
4. **Evidence over alert volume.** Findings should explain the behavior that supports them.
5. **Reproducibility over opaque conclusions.** A reviewer should understand the relevant conditions and verification path.
6. **Human accountability.** Operators remain responsible for authorization, scope, impact decisions, and remediation.

## What VulnGPT is not

VulnGPT is not presented as:

- a guarantee that all vulnerabilities will be found;
- a universal replacement for penetration testers or application security engineers;
- a substitute for secure software development, code review, threat modeling, or incident response;
- an authorization to test third-party systems;
- a certification, compliance attestation, or independent performance benchmark.

## Current availability

VulnGPT is in private beta. Access is coordinated through the [NovaSecLabs private-beta application](https://www.novaseclabs.com/waitlist). Capabilities, supported workflows, evaluation arrangements, and commercial terms should be confirmed directly with NovaSecLabs.

## Related documents

- [Technical Approach](TECHNICAL_APPROACH.md)
- [Evidence and Validation](EVIDENCE_AND_VALIDATION.md)
- [Enterprise Evaluation](ENTERPRISE_EVALUATION.md)
- [FAQ](FAQ.md)
