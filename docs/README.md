# 📚 CinderX Documentation Hub

Welcome to the official technical documentation directory for **CinderX**. 

This folder contains comprehensive guides designed to help developers, maintainers, and open-source contributors understand the platform's architecture, security protocols, and deployment pipelines.

---

## 📖 Directory Index

### 1. Onboarding & Local Setup
*   **[`GettingStarted.md`](GettingStarted.md)**
    *   Step-by-step instructions for spinning up the complete CinderX stack on your local machine.
    *   Includes local database setup, Stellar CLI installation, and Soroban contract compilation instructions.

### 2. Infrastructure & Deployment
*   **[`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)**
    *   The definitive guide for taking CinderX to production.
    *   Contains detailed instructions for deploying the Next.js Frontend to **Vercel** and the Node.js Backend to **Render**.
    *   Includes a master checklist for generating, securing, and mapping all required `.env` variables and API endpoints.

### 3. Engineering & Architecture
*   **[`ARCHITECTURE.md`](ARCHITECTURE.md)**
    *   A deep-dive technical breakdown of the CinderX ecosystem.
    *   Explains the Web2/Web3 hybrid system design, detailing the data flow between the React client, Socket.IO real-time servers, MongoDB, and the Rust-based Stellar Smart Contracts.

### 4. Security & Compliance
*   **[`SECURITY.md`](SECURITY.md)**
    *   The platform's official security policy.
    *   Outlines supported software versions and the responsible disclosure process for reporting vulnerabilities safely.
*   **[`security_checklist.md`](security_checklist.md)**
    *   A rigorous code-level security checklist for project maintainers and contributors.
    *   Covers essential best practices for database sanitization, WebSocket rate-limiting, authentication (Clerk/JWT), and smart contract vulnerability prevention.

---

*If you are looking for information on how to contribute to this repository or our code of conduct, please refer to the [`CONTRIBUTING.md`](../CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md) files located in the project root.*
