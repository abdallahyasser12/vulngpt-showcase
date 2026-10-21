# Security Policy

## Authorized use only

VulnGPT is intended for systems you own or are explicitly authorized to test. Product-side target authorization, organization/project access, runtime policy, and engine execution gates are part of the security boundary; UI visibility is never authorization. Do not use VulnGPT, or anything in this repository, to test systems you do not own or do not have explicit written authorization to test.

## Reporting a vulnerability

If you find a security issue in VulnGPT itself, or in NovaSecLabs' public-facing infrastructure, email **hello@novaseclabs.com** with:

- a clear description of the issue and its impact;
- steps to reproduce;
- any relevant evidence (requests/responses, screenshots) with secrets redacted.

Please do not open a public GitHub issue for a security report. We'll acknowledge receipt and follow up as we assess and address it.

## Scope

This repository is a public-safe showcase package — it does not contain the proprietary scanning engine, production deployment internals, or customer data. Reports about the private beta product should still go through the email above rather than this repository's issue tracker.
