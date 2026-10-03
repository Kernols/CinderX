# CinderX V2 – 4-Week Implementation Plan

## Decisions
| Topic | Decision |
|---|---|
| Entry token | **USDC**, via its Stellar Asset Contract (SAC). The token address is configurable in `initialize`. |
| Contract | **Redeploy a new contract** with Soroban CLI. The old testnet contract `CBDL…WEA` is retired. |
| Admin | **Both.** A Clerk `admin` role for the UI and API, plus an on-chain admin address (multisig account) for the contract. |
| Platform fee | **2.5% (250 bps)**, set at `initialize` and changeable by the admin. |
| Scope | All Phase C features, spread over 4 weeks. **Week 1 is Gaming.** |

> [!NOTE]
> Week 1 starts with the contract rewrite. The new gameplay features (deadlines, forfeit, tiebreak) depend on it. Real on-chain USDC escrow is part of that rewrite.

---

## Week 1 – Gaming & Core Contract

### 1.1 Contract rewrite (`contracts/cinderx/src/lib.rs`, split into modules)
- [ ] Split into `lib.rs`, `types.rs`, `storage.rs`, `errors.rs`, `events.rs`, `test.rs`.
- [ ] `initialize(admin, usdc_token, treasury, fee_bps=250)`, which can run once.
- [ ] Admin functions: `set_admin`, `set_fee`, `set_treasury`, `pause` / `unpause`, `upgrade(wasm_hash)`.
- [ ] `#[contracterror] Error` enum replacing the `panic!` strings.
- [ ] **USDC escrow:**
  - [ ] `create_match` and `join_match` call `token.transfer(player, contract, fee)`.
  - [ ] `predict` escrows the stake.
- [ ] **Payouts:**
  - [ ] `finalize_match` pays the winner `pot - 2.5%` and sends the fee to the treasury.
  - [ ] `claim_prediction` is pull-based.
  - [ ] `refund_draw`, `cancel_match` (for an unjoined match) and `refund_expired`.
- [ ] **Deadlines:** `join_deadline`, `roast_deadline` and `vote_end` on `Match`.
  - [ ] `finalize_match` is permissionless after `vote_end`.
  - [ ] A player who misses the roast deadline forfeits.
- [ ] Anti-abuse rules:
  - [ ] Block a player joining their own match.
  - [ ] Players cannot vote in their own match.
  - [ ] Only registered users can vote.
  - [ ] Min and max entry fee.
  - [ ] Max CID length.
- [ ] Storage: `persistent()` for `Match`, `User` and `Prediction`, with `extend_ttl`. `instance()` for config only.
- [ ] Events: `match_created`, `joined`, `roast`, `vote`, `predicted`, `finalized`, `payout`, `refund`.
- [ ] Fix the badge and stats logic (compute total matches after the update).
- [ ] Tests, with a real SAC mock:
  - [ ] Full lifecycle, draw, forfeit and refunds.
  - [ ] Fee math.
  - [ ] Auth failures.
  - [ ] Double actions.
  - [ ] Pause.
  - [ ] Upgrade.
- [ ] CI check: `cargo fmt`, `cargo clippy`, `cargo test`.

### 1.2 Soroban CLI deployment
- [ ] `stellar contract build` and `stellar contract optimize`.
- [ ] `stellar contract deploy --network testnet` for the new contract, then `invoke initialize` with the USDC SAC address and the multisig admin.
- [ ] `scripts/deploy.ps1` (build, deploy, init and write the contract ID to `.env`).
- [ ] Update `render.yaml`, `.env.example`, the README and the docs with the new contract ID.
- [ ] Set up the multisig admin account (2-of-3 signers).

### 1.3 Backend integration (gaming)
- [ ] Rewrite `battleChain.service.js` for the new methods. Add `ONCHAIN_ESCROW` as a feature flag.
- [ ] Remove the `battleEscrow` XLM transfers when the flag is on.
- [ ] Switch the entry currency to USDC (trustline check at wallet creation, balance display).
- [ ] Move the timers to a persistent queue (BullMQ or Mongo-based) so they survive restarts.
- [ ] Event indexer: poll Soroban RPC `getEvents` and update Mongo.

### 1.4 Gaming features
- [ ] **Spectator chat:** Socket.io rooms per battle, rate-limited and profanity-filtered.
- [ ] **Daily topic:** cron job plus a "Daily Battle" banner.
- [ ] **AI judge as tiebreaker:** on a vote tie, a model scores both roasts. The result is stored with its reason and is shown in the report page.
- [ ] **Battle replay:** a timeline of roasts, votes and phases on `/battle/[id]/report`.

**Week 1 exit criteria:** the full battle runs on testnet using USDC escrow. Contract tests pass. The new contract is deployed with the multisig admin.

---

## Week 2 – Admin Dashboard & Moderation
- [ ] Backend `/api/admin/*`, guarded by `requireAdmin` and an `AuditLog` model:
  - [ ] Overview: users, active battles, volume, fees earned and failed transactions.
  - [ ] Users: search, ban or unban, and set role.
  - [ ] Battles: cancel, finalize and refund.
  - [ ] Config: fee, min and max entry, phase durations.
  - [ ] Treasury: contract, treasury and fee-sponsor balances, with a low-balance alert.
- [ ] Admin actions that touch the contract (pause, fee and upgrade) go through the multisig. The UI prepares the transaction XDR and shows its signing status.
- [ ] Moderation queue: report button on roasts and chat, plus a review queue.
- [ ] Frontend `/admin`: Overview, Users, Battles, Moderation, Treasury, Config and Audit log. The role is checked in `proxy.ts` and on the server.
- [ ] Add an Sentry, a structured logger and Prometheus-style `/metrics`.

## Week 3 – Social, Seasons & Tournaments
- [ ] **Tournaments and brackets:** a contract or backend bracket, with a prize pool paid out in USDC.
- [ ] **Seasonal leaderboard:** seasons, rewards and a reset. Leaderboard stats move to events.
- [ ] **Soulbound badges:** extend `Badge` (more tiers) and show them on profiles.
- [ ] **Follow and referrals:** a follow graph, a referral code and a bonus.
- [ ] **Share cards:** an OG image per battle, built from the existing `BattleCard`.
- [ ] **Notifications:** an in-app feed, plus web push.

## Week 4 – Stellar-native UX, Hardening & SCF Package
- [ ] **Non-custodial path:** Freighter-signed contract calls, so users sign their own fees and joins. Passkey wallet exploration.
- [ ] Security work:
  - [ ] Move user wallet secrets to a KMS and add key rotation.
  - [ ] Keep one auth system (Clerk) and remove Firebase.
  - [ ] Drop the old `stellar-sdk` v11.
  - [ ] Authenticate the socket events.
  - [ ] Add per-wallet rate limits.
- [ ] Refactor `battle.service.js` into smaller services.
- [ ] Tests and CI:
  - [ ] Backend Jest tests.
  - [ ] A Playwright smoke test of the main flow.
  - [ ] GitHub Actions for lint, test and build.
- [ ] OpenAPI spec and PWA support.
- [ ] **SCF package:**
  - [ ] Threat model and `SECURITY.md` update.
  - [ ] Reproducible WASM build, verified on Stellar Expert.
  - [ ] Demo video, metrics and roadmap.
  - [ ] Audit Bank application notes.

---

## Risks
| Risk | Mitigation |
|---|---|
| The contract rewrite takes longer than expected | The tests come first. The `ONCHAIN_ESCROW` flag keeps the old flow as a fallback. |
| Existing users hold XLM balances, not USDC | A migration notice, plus a trustline step during onboarding. |
| The AI judge is a cost and a point of trust | Use it only on ties, and store the reason on IPFS. |

## Next step
Start **Week 1, task 1.1**, the contract rewrite.
