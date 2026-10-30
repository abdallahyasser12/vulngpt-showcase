# Application Security Assessment Plan — Template

> Complete this document with the system owner before testing. This template does not grant authorization. Testing must not begin until the required approvals and scope are documented.

## 1. Engagement record

| Field | Value |
| --- | --- |
| Organization / system owner | [Complete] |
| Assessment owner | [Complete] |
| Technical contact | [Complete] |
| Emergency / stop contact | [Complete] |
| Assessment reference | [Complete] |
| Planned start and end | [Complete] |
| Approval reference | [Link to written authorization] |
| Environment | [Staging / test / other approved environment] |

## 2. Objective

**Business or security question**

[Describe the behavior or security boundary to evaluate.]

**In-scope investigation areas**

[Identify only the areas approved for this assessment.]

**Out-of-scope areas**

[List excluded applications, domains, accounts, techniques, data, and operations.]

## 3. Authorized target inventory

| Target / application | Environment | Owner | In scope? | Constraints |
| --- | --- | --- | --- | --- |
| [Host, API, or app] | [Environment] | [Owner] | [Yes / No] | [Notes] |

Do not use wildcard scope unless the written authorization explicitly defines and approves it.

## 4. Test identities and data

| Identity | Role / tenant | Purpose | Credential owner | Expiry / revocation |
| --- | --- | --- | --- | --- |
| [Test user A] | [Role / tenant] | [Control actor] | [Owner] | [Date / process] |
| [Test user B] | [Role / tenant] | [Comparison actor] | [Owner] | [Date / process] |

Use least-privilege test identities and synthetic records wherever possible. Never paste passwords, API secrets, private keys, or active session tokens into this plan.

## 5. Test scenarios

| Scenario ID | Security invariant | Preconditions | Approved actions | Evidence required |
| --- | --- | --- | --- | --- |
| [S-01] | [Expected security rule] | [State / roles / objects] | [Bounded test actions] | [Observable criteria] |
| [S-02] | [Expected security rule] | [State / roles / objects] | [Bounded test actions] | [Observable criteria] |

Use the [Security Testing Playbook](SECURITY_TESTING_PLAYBOOK.md) to design controlled comparisons.

## 6. Operational constraints

| Constraint | Agreed value |
| --- | --- |
| Permitted test window | [Time and timezone] |
| Maximum request rate / concurrency | [Owner-approved limit] |
| Destructive operations | [Prohibited / explicitly approved list] |
| Production data access | [Prohibited by default / explicit approval] |
| Data exfiltration | [Prohibited / narrowly defined approval] |
| Emergency stop trigger | [Condition] |
| Escalation procedure | [Contact and channel] |
| Maintenance or freeze windows | [Dates / times] |

## 7. Data handling

- Approved data categories: [Complete]
- Prohibited data categories: [Complete]
- Sanitization and redaction requirements: [Complete]
- Approved evidence storage: [Location and access owner]
- Evidence access list: [Complete]
- Retention and deletion requirements: [Complete]
- External service / model processing approval: [Confirm in writing]

Do not proceed with sensitive data until applicable vendor terms, data flows, and processing arrangements have been reviewed.

## 8. Success and stop criteria

**Success criteria**

[Define observable outcomes before testing. Include evidence sufficiency and safety.]

**Stop criteria**

[Unexpected service impact, out-of-scope access, exposure of unrelated data, rate-limit warnings, or another owner-defined trigger.]

## 9. Findings and reporting

- Report recipient: [Complete]
- Approved delivery channel: [Complete]
- Severity methodology: [Customer standard / agreed method]
- Evidence redaction owner: [Complete]
- Remediation review date: [Complete]
- Retest approval and window: [Complete]

Use the [Finding Report Standard](FINDING_REPORT_STANDARD.md) to document results.

## 10. Authorization record

| Approval | Name / role | Date | Reference |
| --- | --- | --- | --- |
| System owner | [Complete] | [Date] | [Reference] |
| Security owner | [Complete] | [Date] | [Reference] |
| Operations owner | [Complete] | [Date] | [Reference] |

**No testing is authorized by this template alone.** Retain the written approval and the final agreed scope with the engagement record.
