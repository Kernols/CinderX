# Security Policy

## Supported Versions

We currently support the latest major version for security updates. 

| Version | Supported          |
| ------- | ------------------ |
| v2.x.x  | :white_check_mark: |
| v1.x.x  | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in CinderX (whether in the Stellar smart contracts, backend services, or frontend client), please DO NOT open a public issue.

Instead, please send a private email to the project maintainers or use GitHub's private vulnerability reporting feature if enabled on the repository.

Please include the following information in your report:
- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof of concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

We will try to acknowledge receipt of your vulnerability report within 48 hours and provide regular updates about our progress.

## Bug Bounty

Currently, we do not operate a formal bug bounty program, but we may offer recognition or small rewards for critical vulnerabilities reported responsibly.

## Smart Contract Security
CinderX utilizes Soroban (Stellar) smart contracts. If your finding is related to the core logic, escrow bypasses, or fee manipulation, please include the specific test case (`src/test.rs`) that triggers the vulnerability.
