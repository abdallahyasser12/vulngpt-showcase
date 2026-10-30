# Public Security Model

## Scope and interpretation

This document is a public, conceptual security model for evaluating the VulnGPT product direction. It is not a complete internal threat model, implementation architecture, penetration-test report, or assertion that every control described below is already deployed.

VulnGPT is in private beta. For actual data flows, deployment details, and current controls, request environment-specific answers from NovaSecLabs before placing sensitive systems or information into an evaluation.

## Security objectives

The product's intended security objectives include:

1. Keep testing within an explicitly authorized target boundary.
2. Preserve separation between customer organizations, projects, users, and test contexts.
3. Prevent one test identity from being silently confused with another.
4. Protect credentials, sessions, scan artifacts, findings, and customer information.
5. Make security-relevant actions reviewable to the extent supported by the evaluation environment.
6. Avoid converting ambiguous observations into unsupported security conclusions.
7. Minimize the data collected and retained for a useful assessment.

These are objectives to validate—not a certification or independent verification statement.

## Information assets

| Asset | Why it matters | Evaluation question |
| --- | --- | --- |
| Customer identity and organization metadata | Defines the administrative boundary | How are tenant and organization boundaries enforced? |
| User and test-actor identities | Determines the security context of a test | How are credentials isolated, protected, and revoked? |
| Target scope and authorization records | Determines where testing is permitted | How is scope enforced at execution time? |
| Requests and responses | May contain secrets or personal data | What is collected, redacted, transmitted, and retained? |
| Scan state and execution artifacts | May expose application behavior and target details | Who can access artifacts and how are they deleted? |
| Findings and evidence | May contain exploitable details or sensitive records | How are findings protected and shared? |
| Audit and operational records | Supports accountability and incident investigation | Which events are recorded and available to customers? |
| Integration credentials | Can grant access to customer systems | How are tokens scoped, stored, rotated, and revoked? |

## Actors and trust boundaries

The following are conceptual actors. The actual implementation and deployment model must be confirmed for the proposed evaluation.

- **Customer administrator:** manages organization-level access and approved evaluation scope.
- **Customer operator:** configures or initiates authorized testing.
- **Test identity:** represents an application user or role used in a controlled assessment.
- **NovaSecLabs operator:** may have operational responsibilities under the applicable service model.
- **External service provider:** may process infrastructure, model, telemetry, or delivery data if used by the selected environment.
- **Target application:** the customer-owned or explicitly authorized application under assessment.

Important boundaries to examine include:

1. Customer organization to customer organization.
2. Customer user to customer user and role.
3. Customer control plane to scan execution environment.
4. VulnGPT service to target application.
5. VulnGPT service to model, storage, and infrastructure providers.
6. Customer-accessible results to internal operational support systems.

## Threat scenarios and review questions

| Threat scenario | Security property at risk | Questions for evaluation |
| --- | --- | --- |
| Cross-tenant access | Confidentiality and tenant isolation | Can one organization retrieve another organization's projects, artifacts, or findings? |
| Privilege escalation | Administrative integrity | Are permissions enforced server-side for every sensitive action? |
| Scope manipulation | Target authorization | Can a user or execution path test a destination outside approved scope? |
| Credential exposure | Customer account and target security | Are secrets excluded from logs, public reports, and unnecessary model context? |
| Session confusion | Identity integrity | Are actor and session contexts kept distinct across multi-step tests? |
| Artifact overexposure | Confidentiality | Are requests, responses, and findings restricted to authorized users? |
| Unsafe test execution | Availability and data integrity | Are destructive operations, rate limits, and stop conditions controlled? |
| Dependency or provider compromise | Service integrity and confidentiality | Which external dependencies and subprocessors are in the data path? |
| Unsupported finding promotion | Decision integrity | Can an ambiguous signal be distinguished from a validated security conclusion? |
| Retention beyond expectation | Privacy and confidentiality | What retention and deletion rules apply to each artifact category and backups? |

## Secure evaluation assumptions

Before an evaluation begins, customer and vendor stakeholders should agree on:

- written authorization and target scope;
- identities, roles, and environments permitted for testing;
- allowed state-changing actions and prohibited operations;
- data categories that may be processed;
- deployment and subprocessor context;
- access to evidence and test artifacts;
- retention, export, and deletion terms;
- incident escalation and emergency stop procedures.

## Controls requiring direct confirmation

This public repository does not assert that VulnGPT currently provides any particular implementation of:

- SSO, SAML, OIDC, SCIM, or customer-managed identity;
- customer-managed encryption keys or a specific cryptographic design;
- a particular cloud region or data-residency option;
- a particular isolation, secrets-management, or key-rotation mechanism;
- immutable audit logs or a specified audit retention period;
- SOC 2, ISO 27001, penetration-test, or other independent assurance;
- a contractual SLA, RTO, RPO, or incident-notification window.

Request current documentation and contractual evidence for the exact product environment and plan being evaluated. A questionnaire or roadmap statement is not proof that a control exists.

## Related material

- [Security and Privacy](SECURITY_AND_PRIVACY.md)
- [Enterprise Evaluation](ENTERPRISE_EVALUATION.md)
- [Responsible Testing](RESPONSIBLE_TESTING.md)
- [Security Policy](../SECURITY.md)
