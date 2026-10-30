# Finding Report Standard

## Purpose

A finding report should allow an authorized reviewer to understand the security expectation, test context, observed behavior, impact, limitations, and remediation path.

This standard is a public reporting guide. It does not claim that every field is currently generated automatically by VulnGPT or that every output format is available in the private beta.

## Report principles

1. Distinguish observation from inference.
2. Identify the authorization and test scope.
3. Describe the relevant actors, roles, tenants, objects, sessions, and states.
4. State the security invariant that was expected to hold.
5. Show the controlled action and the observable result.
6. Include a control comparison where practical.
7. Describe impact supported by evidence, not hypothetical maximum impact.
8. State uncertainty, limitations, and untested conditions.
9. Provide a safe, minimal reproduction path.
10. Redact secrets, personal data, and unrelated customer information.

## Recommended finding structure

### 1. Title

Use a concise title that describes the security boundary or behavior that failed.

### 2. Summary

Explain what happened, under which test context, and why it matters.

### 3. Affected component

Identify the application, environment, endpoint or workflow, object type, and affected version where known. Avoid including unnecessary internal identifiers.

### 4. Security expectation

State the expected authorization rule, workflow precondition, or invariant.

### 5. Preconditions and actor context

Document:

- test actor and effective role;
- tenant or organization context;
- object ownership and relevant relationships;
- session and authentication state;
- workflow state and required prior actions.

### 6. Reproduction steps

Provide a minimal, ordered sequence that an authorized reviewer can repeat. Use placeholders for secrets and synthetic identifiers. Do not include a live token or password.

### 7. Expected versus observed behavior

| Dimension | Expected | Observed |
| --- | --- | --- |
| Authorization | [Expected boundary] | [Observed behavior] |
| Data access | [Expected visibility] | [Observed visibility] |
| State transition | [Expected state] | [Observed state] |
| Side effect | [Expected result] | [Observed result] |

### 8. Evidence

Attach only the minimum request/response excerpt, state observation, screenshot, or audit record needed to support the finding. Redact:

- passwords and API keys;
- cookies, bearer tokens, and session IDs;
- personal information;
- unrelated tenant or customer records;
- proprietary data not necessary to demonstrate impact.

### 9. Impact and severity rationale

Explain the affected security property, the actors and data exposed, the preconditions, and the demonstrated consequence.

Severity should follow the customer's agreed methodology and be justified by the demonstrated impact. Do not invent a CVSS score or imply a validated score when one has not been calculated.

### 10. Alternative explanations and limitations

Record relevant caching, asynchronous processing, WAF, rate-limit, session, race, or environment effects considered. State what remains unknown.

### 11. Remediation guidance

Describe the control that should be enforced at the authoritative server-side boundary. Keep remediation specific to the demonstrated failure and avoid assuming the underlying implementation.

### 12. Retest record

Record the retest date, environment, actor and role context, original invariant, observed outcome, and any changed conditions.

## Finding confidence versus severity

Confidence and severity answer different questions.

- **Confidence** describes how strongly the evidence supports the finding.
- **Severity** describes the risk of the demonstrated security impact.

A high-impact hypothesis with weak evidence should not be reported as a confirmed critical vulnerability. A well-confirmed issue may still have limited impact.

## Report hygiene

Store reports only in approved locations. Limit access to authorized recipients. Agree retention and deletion requirements with the system owner. Do not publish findings or exploit detail without coordinated authorization.

## Template

A copy-ready blank report is available at [templates/finding-report.md](../templates/finding-report.md).
