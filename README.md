<div align="center">
  <img src="https://raw.githubusercontent.com/Kernols/cinderx/main/Frontend/public/logo.jpeg" alt="CinderX Logo" width="120" height="120" style="border-radius: 20px;" />
  
  # 🔥 CinderX
  
  **Ignite. Battle. Conquer.** 
  
  *Next-gen gamified roast battle platform built on the Stellar blockchain.*
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
  [![Stellar](https://img.shields.io/badge/Network-Stellar_Testnet-black.svg)](https://stellar.org)

  [Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Contributing](#-contributing)
</div>

---

CinderX is a decentralized, real-time multiplayer arena where users engage in social roast battles. Built on **Stellar**, spectators can place predictions, cast votes, and winners take home real XLM pots. 

Built with an obsession for beginner-friendly UX, CinderX seamlessly abstracts away crypto complexities with managed wallets, while retaining power-user features through direct Freighter connections.

> **Built and maintained by [Suman Ghosh](https://github.com/SUMAN967-GHOSH) & the [Kernols](https://github.com/Kernols) Organization.**

---

## ✨ Features

*   🥊 **Live Roast Battles** — Real-time 1v1 arenas powered by Socket.IO.
*   💸 **Stellar Wallet Abstraction** — Auto-generated managed wallets for Web2 users, or Freighter connect for Web3 natives.
*   🗳️ **Spectator Voting & Predictions** — The crowd decides the winner and earns XLM for correct predictions.
*   🏆 **Leaderboard & XP System** — Climb the ranks, unlock badges, and earn reputation.
*   🔐 **Dual Authentication** — Clerk (Google/email) paired seamlessly with custom wallet JWT auth.
*   🆕 **Beginner-Friendly UX** — Integrated Welcome Tours, interactive 'How to Play' panels, and global Toast notifications.

---

## 🏗️ Architecture

CinderX is split into three primary modules:

1.  **Frontend (`/Frontend`)**: A highly responsive Next.js 14 application styled with Tailwind CSS and animated using Framer Motion. 
2.  **Backend (`/Backend`)**: A robust Node.js/Express REST API utilizing MongoDB for persistence and Socket.IO for real-time battle state synchronization.
3.  **Smart Contracts (`/contracts`)**: Soroban Rust contracts deployed on the Stellar network to handle trustless prize pooling and payouts.

### Tech Stack
*   **Client**: Next.js 14, React, Tailwind CSS, TypeScript, Framer Motion
*   **Server**: Node.js, Express, Socket.IO, Mongoose
*   **Blockchain**: Stellar SDK, Soroban (Rust)
*   **Infrastructure**: Vercel (Frontend), Render (Backend), Pinata IPFS (Storage)

---

## 🚀 Getting Started

We love open-source contributors! Follow these steps to spin up the project locally.

### Prerequisites
*   Node.js ≥ 18.x
*   MongoDB Atlas Account (or local instance)
*   Clerk Account (for Auth)
*   Stellar Testnet Account

### 1. Clone the repository
```bash
git clone https://github.com/Kernols/cinderx.git
cd cinderx
```

### 2. Setup the Backend
```bash
cd Backend
npm install
cp .env.example .env
# Fill out the .env file with your local MongoDB URI, Clerk Secret, and Stellar Keys.
npm run dev
```

### 3. Setup the Frontend
```bash
cd ../Frontend
npm install
cp .env.example .env.local
# Fill out the .env.local with your Clerk Publishable Key and local API endpoints.
npm run dev
```

Your app should now be running on `http://localhost:3000`! 🎉

---

## 🤝 Contributing

CinderX is an open-source project and we welcome contributions from the community! Whether it's a bug fix, new feature, or documentation update, we'd love your help.

Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started. 

*   **Bug Reports**: Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).
*   **Feature Requests**: Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).

Please ensure you adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.

---

## 🌍 Environment Variables

For full CI/CD deployment via GitHub Actions, ensure the following secrets are configured in your repository:
*   `VERCEL_TOKEN`: Your Vercel deployment token.
*   `RENDER_DEPLOY_HOOK_URL`: Your Render webhook trigger URL.

See `.github/workflows/` for our automated deployment pipelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
© 2026 Suman Ghosh / Kernols
