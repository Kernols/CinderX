# 🚀 CinderX: Complete Deployment & Environment Guide

This guide will walk you through exactly where to get every single environment variable and how to successfully deploy your frontend to **Vercel** and your backend to **Render**.

---

## 🔑 Phase 1: Gather Your API Keys

Before you deploy, you need to set up accounts for the free tier of the following services. Keep a notepad open to copy-paste these keys.

### 1. MongoDB (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database) and create a free cluster.
2. Under **Database Access**, create a user and password.
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`).
4. Click **Connect** -> **Connect your application** and copy the connection string.
5. Replace `<password>` with your actual database password.
   * **Save as:** `MONGODB_URI`

### 2. Clerk (Authentication)
1. Go to [Clerk.com](https://clerk.com/) and create a new application.
2. Select **Google** and **Email** as sign-in providers.
3. On your dashboard, go to **API Keys**.
   * **Save as:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_...`)
   * **Save as:** `CLERK_SECRET_KEY` (starts with `sk_...`)
4. Go to **Webhooks** in the Clerk sidebar, and click **Add Endpoint**. 
   * *We will come back to this to paste your backend URL later. For now, just generate the secret.*
   * **Save as:** `CLERK_WEBHOOK_SECRET` (starts with `whsec_...`)

### 3. Pinata (Image Storage)
1. Go to [Pinata.cloud](https://www.pinata.cloud/) and create a free account.
2. Go to **API Keys** -> **New Key**. Give it admin permissions.
   * **Save as:** `PINATA_API_KEY`
   * **Save as:** `PINATA_SECRET_API_KEY`

### 4. Stellar / Crypto Setup
1. **Escrow Wallet:** Go to the [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=testnet) and generate a new keypair for the Testnet. Click "Fund with Friendbot".
   * **Save as:** `STELLAR_ESCROW_SECRET` (starts with `S...`)
2. **Contract ID:** If you have deployed the Soroban contract locally using the `GettingStarted.md` guide, copy the Contract ID output.
   * **Save as:** `STELLAR_CONTRACT_ID` (starts with `C...`)

### 5. Generate Security Keys
You need two random, secure strings for your backend. You can generate these by typing this in your terminal or using an online hex generator.
* **Save as:** `JWT_SECRET` (just mash your keyboard for 64 characters, or use a password generator)
* **Save as:** `ENCRYPTION_KEY` (must be exactly 32 random characters/bytes)

---

## ☁️ Phase 2: Deploy the Backend (Render)

1. Go to [Render.com](https://render.com) and click **New** -> **Web Service**.
2. Connect your GitHub account and select the `Kernols/cinderx` repository.
3. Configure the service:
   * **Name:** `cinderx-backend`
   * **Root Directory:** `Backend`
   * **Build Command:** `npm ci`
   * **Start Command:** `npm start`
4. Scroll down to **Environment Variables** and add these exactly as shown:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | *(Your MongoDB connection string)* |
| `CLERK_SECRET_KEY` | *(Your Clerk sk_...)* |
| `CLERK_WEBHOOK_SECRET` | *(Your Clerk whsec_...)* |
| `JWT_SECRET` | *(Your 64-char random string)* |
| `ENCRYPTION_KEY` | *(Your 32-char random string)* |
| `STELLAR_NETWORK` | `testnet` |
| `STELLAR_CONTRACT_ID` | *(Your contract ID)* |
| `STELLAR_ESCROW_SECRET` | *(Your Stellar S... secret key)* |
| `PINATA_API_KEY` | *(Your Pinata API key)* |
| `PINATA_SECRET_API_KEY` | *(Your Pinata Secret key)* |
| `CLIENT_ORIGINS` | `*` *(We will change this to your frontend URL later)* |

5. Click **Create Web Service**. 
6. Wait for it to build. Once it's live, copy the URL at the top left (e.g., `https://cinderx-backend.onrender.com`).

---

## 🌐 Phase 3: Deploy the Frontend (Vercel)

1. Go to [Vercel.com](https://vercel.com) and click **Add New** -> **Project**.
2. Import the `Kernols/cinderx` repository.
3. **Important:** Change the **Framework Preset** to `Next.js` and set the **Root Directory** to `Frontend`.
4. Open the **Environment Variables** dropdown and add these:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | *(Paste your Render backend URL here)* |
| `NEXT_PUBLIC_SOCKET_URL` | *(Paste your Render backend URL here)* |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | *(Your Clerk pk_...)* |
| `CLERK_SECRET_KEY` | *(Your Clerk sk_...)* |

5. Click **Deploy**. Vercel will build your app and give you a live URL (e.g., `https://cinderx.vercel.app`).

---

## 🔗 Phase 4: Final Connections

Your apps are live! But they need to be strictly connected to each other for security.

1. **Lock down the Backend:**
   * Go back to Render -> `cinderx-backend` -> **Environment**.
   * Change `CLIENT_ORIGINS` from `*` to your new Vercel URL (e.g., `https://cinderx.vercel.app`).
   * Save changes.

2. **Connect Clerk Webhooks:**
   * Go back to Clerk -> **Webhooks**.
   * Edit your endpoint URL to point to your Render backend: `https://cinderx-backend.onrender.com/api/webhooks/clerk`
   * Ensure it subscribes to `user.created` and `user.updated` events.

**🎉 Congratulations! CinderX is fully deployed, secure, and ready for players!**
