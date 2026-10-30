# Responsible Testing

VulnGPT is intended for applications and infrastructure that the operator owns or is explicitly authorized to test. Access to a product or endpoint is not permission to assess it.

## Before testing

- Obtain written authorization from the system owner.
- Define exact hosts, applications, APIs, environments, identities, and test windows.
- Document allowed and prohibited techniques.
- Use dedicated, least-privilege test accounts.
- Prefer synthetic records and non-production data.
- Agree on rate limits, concurrency, destructive actions, and emergency stop procedures.
- Identify an owner who can pause testing if the application becomes unstable.

## During testing

- Stay within the approved scope.
- Do not access, copy, alter, or disclose unrelated user data.
- Avoid destructive actions and uncontrolled state changes.
- Respect rate limits and operational constraints.
- Stop and escalate when testing causes unexpected service impact or exposes sensitive information.
- Preserve only the evidence necessary to support the authorized assessment.

## After testing

- Securely share findings with the authorized owner.
- Redact credentials, tokens, personal data, and unrelated records.
- Explain conditions, limitations, and reproducibility.
- Agree on remediation and retest scope.
- Handle and delete retained artifacts according to the applicable agreement and customer policy.

## Public disclosure

Do not publish exploit details or sensitive vulnerability information before coordinating with the affected owner. For concerns involving VulnGPT or NovaSecLabs public infrastructure, follow [SECURITY.md](../SECURITY.md).

This guidance does not replace applicable law, contracts, customer rules, or professional obligations.
