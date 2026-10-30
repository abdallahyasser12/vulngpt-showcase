# Security and Privacy — Public Evaluation Notes

## Purpose and scope

This document helps prospective customers identify the security and privacy questions that should be answered before using VulnGPT with sensitive systems or data.

It is not a certification, penetration-test report, privacy notice, data-processing agreement, or complete description of production controls. Product-specific answers must be confirmed with NovaSecLabs for the actual beta environment and engagement.

## Publicly stated boundaries

- VulnGPT is in private beta.
- VulnGPT is intended for applications and infrastructure that the operator owns or is explicitly authorized to test.
- This repository contains the public showcase website and supporting documentation; it does not publish the proprietary scanning engine or production deployment configuration.
- No SOC 2, ISO 27001, or independent product-security certification claim is made here.
- No universal zero-false-positive or real-world detection-rate guarantee is made here.

## Data minimization for evaluations

Before an evaluation, agree which data categories are necessary. Prefer synthetic records, dedicated test accounts, and non-production environments.

Do not provide:

- production passwords, reusable API keys, or private signing keys;
- live session cookies or bearer tokens in public issues;
- customer datasets unrelated to the approved test;
- regulated, personal, or confidential data without prior written review and authorization.

Redact secrets and unrelated personal information from screenshots, traces, requests, and reports.

## Questions to resolve before sensitive use

The following topics require current, environment-specific answers from NovaSecLabs:

| Topic | What must be established |
| --- | --- |
| Data inventory | Which request, response, credential, artifact, finding, and log categories are processed? |
| Data flow | Which systems and subprocessors receive each category? |
| Processing location | Where are data stored and processed, including relevant backups? |
| Encryption | Which encryption protocols and key-management practices apply in transit and at rest? |
| Access | Which personnel and services can access customer data, and under what approval and logging controls? |
| Retention | What retention schedule applies to each data category? |
| Deletion | How are customer-requested deletion and backup expiry handled? |
| Model providers | Which model services may receive data, and what contractual data-use terms apply? |
| Incident response | What notification, escalation, and evidence-preservation process applies? |
| Assurance | Which independent reports, certificates, or assessments are available for the relevant service scope? |

This repository intentionally does not invent answers to those questions. Obtain written, current answers and applicable contractual terms before placing sensitive data into the service.

## Customer-side responsibilities

Customers evaluating the product should:

1. Confirm authorization and permitted testing scope.
2. Use dedicated, least-privilege test identities.
3. Prefer synthetic or sanitized data.
4. Review the permitted test actions and operational constraints.
5. Restrict access to evaluation artifacts.
6. Retain records in accordance with their own policy.
7. Review current vendor terms before production or regulated-data use.

## Reporting a security concern

Do not publish vulnerabilities, credentials, customer data, or exploit details in a public issue. Follow the private reporting instructions in [SECURITY.md](../SECURITY.md).

## Contact

For product and evaluation questions, use the [NovaSecLabs website](https://www.novaseclabs.com). Do not send secrets or sensitive system details through a general contact form.
