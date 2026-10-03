# Week 1: Gaming & Core Contract Implementation Plan

## Phase 1.1: Smart Contract Architecture & State (WIP)
- [ ] Refactor `lib.rs` into multiple files: `types.rs`, `storage.rs`, `errors.rs`, `events.rs`, `admin.rs`, and `lib.rs`.
- [ ] Define `Error` enum (`#[contracterror]`) for explicit error handling instead of panics.
- [ ] Update `Match` struct to include `join_deadline`, `roast_deadline`, and `vote_end`.
- [ ] Add config storage: Admin address, Treasury address, USDC token address, and Platform Fee (bps).

## Phase 1.2: USDC Escrow & Core Logic
- [ ] Add `initialize(admin, usdc_token, treasury, fee_bps)` to configure the contract.
- [ ] Integrate `soroban_sdk::token::Client`.
- [ ] Update `create_match` and `join_match` to transfer USDC from players to the contract.
- [ ] Update `predict` to transfer USDC from predictors to the contract.
- [ ] Update `finalize_match` to calculate the platform fee, send it to the treasury, and send the remaining pot to the winner.
- [ ] Add `claim_prediction` (pull-based payout for predictors).
- [ ] Add `refund_draw`, `cancel_match` (for unjoined matches), and `refund_expired`.

## Phase 1.3: Anti-Abuse & Hardening
- [ ] Enforce deadlines using `env.ledger().timestamp()`.
- [ ] Prevent self-joining (`player1 != player2`).
- [ ] Prevent players from voting in their own match.
- [ ] Ensure only registered users can vote.
- [ ] Use `persistent()` storage for `Match`, `User`, and `Prediction` with TTL extensions (`extend_ttl`).

## Phase 1.4: Testing & Deployment
- [ ] Write unit tests with token mocks for full lifecycle, refunds, draws, and edge cases.
- [ ] Run `cargo clippy`, `cargo fmt`, and `cargo test`.
- [ ] Build and optimize WASM (`stellar contract build`).
- [ ] Deploy to testnet and run `initialize`.

## Phase 1.5: Backend Integration
- [ ] Add `ONCHAIN_ESCROW` flag in backend.
- [ ] Update `battleChain.service.js` to call the new contract methods and drop `battleEscrow.service.js` logic when flag is true.
- [ ] Update database/services to store and check new deadlines.

## Phase 1.6: Gaming Features
- [ ] Spectator Chat (Socket.io).
- [ ] Daily Topic cron job.
- [ ] AI Judge tiebreaker.
- [ ] Battle Replay.
