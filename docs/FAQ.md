# Frequently Asked Questions

## What is VulnGPT?

VulnGPT is an autonomous web application security testing product by NovaSecLabs. It is being developed to investigate application behavior across authenticated identities, authorization boundaries, object ownership, state transitions, and business workflows.

## What does "autonomous" mean here?

Autonomous means VulnGPT plans and runs the test steps itself inside the target, scope, and runtime budget you authorize; it does not mean unsupervised: you verify the target, set scope, confirm authorization, and review the evidence.

## Does autonomous mean unsupervised?

No. Autonomous describes who plans and runs the individual test steps, not who is accountable. You verify the target, set the scope and runtime budget, confirm that you are authorized to test, and review the evidence before acting on it. No operation without human oversight is claimed.

## What problem is it focused on?

Some security weaknesses depend on relationships and sequences rather than one isolated request. VulnGPT's product direction focuses on contextual testing and evidence-oriented validation of those behaviors.

## Is VulnGPT open source?

No. This repository is a public showcase website and documentation repository. It does not contain the proprietary scanning engine or production backend.

## Is the product generally available?

No. VulnGPT is in private beta. Apply through the [NovaSecLabs private-beta page](https://www.novaseclabs.com/waitlist).

## Does VulnGPT replace penetration testers?

No such claim is made. The product is intended to support security practitioners and application builders. Authorization, test design, evidence review, risk decisions, and remediation still require appropriate human accountability.

## Does VulnGPT find every vulnerability?

No security testing product can responsibly guarantee universal detection. Coverage depends on the application, configuration, authorization, reachable workflows, test context, and supported capabilities.

## Does VulnGPT have zero false positives?

No universal zero-false-positive claim is made. A suspicious signal should be investigated and evaluated against observable evidence and plausible alternative explanations.

## Are benchmark scores published?

The public G1 benchmark record is currently marked as under review for publication. Its prior public explanation contained unreconciled arithmetic. Do not use the historic figures as approved marketing claims. See [Benchmark publication status](../BENCHMARK_G1.md).

## Is VulnGPT independently certified or audited?

This repository makes no SOC 2, ISO 27001, or independent product-security certification claim. Prospective customers should request current assurance documents and confirm their scope directly with NovaSecLabs.

## Which applications, frameworks, or integrations are supported?

The public showcase does not provide a complete support matrix. Confirm the specific application architecture, authentication flow, workflow, deployment requirements, and integration needs during a private-beta evaluation.

## Can I test a third-party website?

Only with explicit authorization from the system owner and within the agreed scope. Public availability does not grant permission to test a system.

## Where can I request access?

Use the [private-beta application](https://www.novaseclabs.com/waitlist).

## Where do I report a security issue?

Do not open a public issue with exploit details or sensitive data. Follow the private process in [SECURITY.md](../SECURITY.md).
