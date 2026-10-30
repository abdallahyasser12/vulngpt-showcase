# Enterprise Evaluation Guide

This guide is intended for application security leaders, product security teams, security architecture, IT, procurement, privacy, and risk stakeholders evaluating VulnGPT.

It is a diligence framework—not a security certification, contractual commitment, or statement that every listed integration or control is currently available.

## 1. Evaluation summary

| Item | Publicly stated position |
| --- | --- |
| Product | VulnGPT |
| Provider | NovaSecLabs |
| Category | AI-assisted web application security testing |
| Availability | Private beta |
| Primary focus | Contextual testing across identities, authorization boundaries, object ownership, workflow state, and business logic |
| Engagement | Access coordinated through the private-beta application |
| Public implementation | Showcase website and supporting documentation only; scanning engine is not published in this repository |
| Independent assurance | No SOC 2, ISO 27001, or independent product-security certification claim is made in this repository |

Confirm the current product scope and engagement model directly with NovaSecLabs before procurement or production use.

## 2. Technical and architecture diligence

Ask the vendor to describe the actual evaluation environment and provide current architecture material appropriate to the engagement.

- Which deployment model is available for this evaluation?
- Which components process target requests, credentials, test artifacts, and findings?
- Which external services or subprocessors are involved?
- What network destinations must the customer permit?
- How are environments separated?
- Which components are operated by NovaSecLabs and which are customer-managed?
- What happens when a scan is paused, interrupted, or resumed?
- Which logs and audit records are available to the customer?

**Evidence to request:** a current architecture diagram, data-flow diagram, component inventory, deployment prerequisites, and a written description of relevant trust boundaries.

Do not infer a deployment option from this checklist; availability must be confirmed.

## 3. Identity and access management

- How are customer users authenticated?
- Which identity providers and authentication protocols are supported today?
- Are SSO, SAML, OIDC, MFA, and SCIM available for the proposed plan?
- How are organization, project, and user permissions enforced?
- How are service accounts, API credentials, and test identities managed?
- Can customer administrators review and revoke access?
- Which security-relevant actions are recorded in audit logs?

**Evidence to request:** current access-control documentation, supported integration list, role/permission matrix, and an example audit record with sensitive data removed.

## 4. Target authorization and testing safety

- How is ownership or authorization for a target established?
- How are approved hosts, environments, and test windows represented?
- How are out-of-scope targets and prohibited actions handled?
- Can customers constrain testing to approved accounts and environments?
- How are destructive or state-changing tests identified and controlled?
- What operator approval is required before a test begins?
- How are scope changes recorded?

**Evidence to request:** the current authorization workflow, sample scope configuration, and an explanation of runtime enforcement boundaries.

## 5. Data protection and privacy

Request precise answers for each data category rather than relying on general statements such as "secure by design."

- Which target URLs, requests, responses, credentials, cookies, files, and findings are collected?
- Which categories of data may be sent to model or infrastructure providers?
- Is customer data used for model training? Under what terms?
- Where is data processed and stored?
- What encryption controls apply in transit and at rest?
- Who can access customer data, and under which support or operational circumstances?
- What retention periods apply to scans, artifacts, logs, and backups?
- How can an authorized customer request deletion?
- What happens to backups after deletion?
- Which subprocessors and data-processing agreements apply?

**Evidence to request:** current privacy notice, data-flow and retention documentation, subprocessor list, contractual data-processing terms, and written answers for any data categories relevant to the customer's use case.

Do not upload production secrets, personal data, or regulated information into an evaluation until the applicable handling terms have been reviewed and approved.

## 6. Security assurance and compliance

Ask for the current status and scope of any assurance materials relevant to the deployment.

- Is there an independent security assessment? What systems and dates does it cover?
- Are SOC 2 reports or ISO 27001 certificates available? Which legal entity and scope are covered?
- Is there a vulnerability disclosure and remediation process?
- Are dependencies and build artifacts assessed?
- How are security incidents escalated and communicated?
- Are business continuity and disaster recovery arrangements documented?

A roadmap, self-assessment, or policy document is not equivalent to an independently issued report or certificate. Ask to review the actual artifact under appropriate confidentiality terms.

## 7. Operations and service management

- What availability and support commitments apply to the proposed beta engagement?
- Is there a documented incident escalation path?
- What maintenance or service-change notifications are provided?
- What happens to running work during service interruption?
- Which usage, scan, and activity records can administrators review?
- What are the current recovery and continuity arrangements?

Do not assume an SLA, RTO, RPO, or support response time unless it is explicitly provided in the applicable agreement.

## 8. Reporting and workflow integration

- What report formats and evidence artifacts are available?
- Can findings be exported for customer-controlled retention?
- Are ticketing, issue tracking, CI/CD, or security-platform integrations currently supported?
- Can findings be assigned, triaged, retested, and closed?
- How are duplicate or recurring observations handled?
- Which fields can be customized for a customer's severity and remediation process?

Request a demonstration using synthetic or approved test data before relying on an integration in production.

## 9. Proof-of-value evaluation

A useful evaluation should be bounded and measurable.

1. Choose an application or test environment that the organization is authorized to assess.
2. Define the approved targets, test identities, roles, and prohibited actions.
3. Select representative workflows with known security expectations.
4. Establish ground truth using an independent review or a controlled test fixture where possible.
5. Agree on success criteria before execution.
6. Review evidence quality, reproducibility, coverage limitations, operational impact, and analyst effort.
7. Record unsupported workflows and unresolved findings instead of treating them as successes.
8. Decide whether the observed value justifies a broader evaluation.

Suggested evaluation dimensions:

| Dimension | Evaluation question |
| --- | --- |
| Scope discipline | Did testing remain within the authorized boundary? |
| Context fidelity | Were the relevant actors, sessions, roles, and object relationships represented correctly? |
| Evidence quality | Can a reviewer reproduce and understand the claimed behavior? |
| Precision | Were unsupported signals clearly distinguished from confirmed issues? |
| Coverage transparency | Are untested or unsupported workflows visible? |
| Operational safety | Were rate, state, and production-impact constraints respected? |
| Analyst usefulness | Did the output help a security professional reach a better decision? |

## 10. Customer evaluation record

Use this template to keep diligence findings explicit.

| Field | Customer record |
| --- | --- |
| Organization and business owner | To be completed |
| Technical owner | To be completed |
| Intended application and environment | To be completed |
| Approved scope and test window | To be completed |
| Test identities and roles | To be completed |
| Data categories in scope | To be completed |
| Required deployment model | To be confirmed |
| Required identity integrations | To be confirmed |
| Required assurance documents | To be confirmed |
| Success criteria | To be agreed before testing |
| Open risks and conditions | To be tracked |
| Approval to proceed | To be recorded by the customer |

## 11. Evaluation contact

Start with the [NovaSecLabs website](https://www.novaseclabs.com) or [private-beta application](https://www.novaseclabs.com/waitlist). Share only non-sensitive evaluation details through public channels. Security findings and sensitive architecture material should be exchanged through an agreed private channel.
