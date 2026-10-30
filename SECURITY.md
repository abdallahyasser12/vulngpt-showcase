# Security Policy

## Authorized use only

VulnGPT is intended for applications and infrastructure that the operator owns or is explicitly authorized to test. Public reachability is not permission. The operator is responsible for obtaining authorization and respecting the written scope, test window, and operational restrictions.

Product-side target authorization, organization/project access, runtime policy, and execution controls are part of the intended security boundary. UI visibility alone must never be treated as authorization.

## Reporting a vulnerability

The public showcase also publishes a machine-readable contact and policy pointer at [/.well-known/security.txt](https://showcase.novaseclabs.com/.well-known/security.txt). This policy remains the authoritative reporting guidance.

If you discover a security issue affecting VulnGPT or NovaSecLabs public infrastructure, report it privately to:

**hello@novaseclabs.com**

Please include, where safe:

- a concise description and potential impact;
- affected product or public service;
- steps to reproduce in an authorized environment;
- timestamps and relevant request/response evidence;
- the minimum information needed to reproduce the issue.

Redact passwords, API keys, bearer tokens, session cookies, personal data, and unrelated customer information. Do not attach a weaponized proof of concept when a minimal reproduction is sufficient.

## Coordinated disclosure

- Do not publish exploit details or sensitive evidence before coordinating with NovaSecLabs.
- Do not access, modify, or retain third-party data beyond what is strictly necessary and authorized.
- Stop testing if you encounter data belonging to another customer or an unexpected service impact.
- NovaSecLabs will assess reports and coordinate any disclosure as appropriate.

No public response-time or bounty commitment is stated in this policy. Do not assume an SLA or reward unless separately agreed in writing.

## Repository scope

This public repository contains the showcase website and supporting public documentation. It does not contain the proprietary scanning engine, production backend, deployment secrets, or customer data.

For non-security questions or product access, use the [NovaSecLabs website](https://www.novaseclabs.com) or [private-beta application](https://www.novaseclabs.com/waitlist).

## Scope exclusions

Do not use this policy as authorization to test unrelated systems. Reports involving third-party applications should be sent to their respective owners under their published disclosure policies.
