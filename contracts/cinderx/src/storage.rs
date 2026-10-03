use soroban_sdk::{contracttype, Address, Env};
use crate::types::Badge;

#[contracttype]
pub enum DataKey {
    Admin,
    Token,
    Treasury,
    FeeBps,
    User(Address),
    Match(u32),
    UserBadge(Address, Badge),
    Prediction(u32, Address),
    MatchCount,
    HasJoined(Address, u32),
    HasVoted(Address, u32),
}

pub const DAY_IN_LEDGERS: u32 = 17280; // Assuming ~5s per ledger
pub const INSTANCE_BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS; // 30 days
pub const PERSISTENT_BUMP_AMOUNT: u32 = 60 * DAY_IN_LEDGERS; // 60 days

pub fn extend_instance_ttl(e: &Env) {
    e.storage().instance().extend_ttl(INSTANCE_BUMP_AMOUNT, INSTANCE_BUMP_AMOUNT);
}
