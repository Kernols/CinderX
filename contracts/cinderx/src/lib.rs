#![no_std]

mod types;
mod storage;
mod errors;
mod events;
mod admin;
#[cfg(test)]
mod test;

use soroban_sdk::{
    contract, contractimpl, token, Address, Env, String
};

use types::{Match, MatchStatus, User, Prediction, Badge};
use storage::{DataKey, extend_instance_ttl, INSTANCE_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT};
use errors::Error;

pub trait CinderXTrait {
    fn initialize(e: Env, admin: Address, token: Address, treasury: Address, fee_bps: u32) -> Result<(), Error>;
    fn register_user(e: Env, user: Address, username: String, profile_cid: String) -> Result<(), Error>;
    fn get_user(e: Env, user: Address) -> Option<User>;
    fn update_profile(e: Env, user: Address, profile_cid: String) -> Result<(), Error>;
    fn create_match(e: Env, entry_fee: i128, topic_cid: String, user: Address, join_deadline: u64, roast_deadline: u64, vote_end: u64) -> Result<u32, Error>;
    fn join_match(e: Env, match_id: u32, player: Address) -> Result<(), Error>;
    fn submit_roast(e: Env, match_id: u32, roast_cid: String, player: Address) -> Result<(), Error>;
    fn vote(e: Env, match_id: u32, selected_player: Address, voter: Address) -> Result<(), Error>;
    fn predict(e: Env, match_id: u32, selected_player: Address, amount: i128, predictor: Address) -> Result<(), Error>;
    fn finalize_match(e: Env, match_id: u32) -> Result<(), Error>;
}

#[contract]
pub struct CinderX;

#[contractimpl]
impl CinderXTrait for CinderX {
    fn initialize(e: Env, admin: Address, token: Address, treasury: Address, fee_bps: u32) -> Result<(), Error> {
        if admin::has_admin(&e) {
            return Err(Error::AlreadyInitialized);
        }
        if fee_bps > 10000 {
            return Err(Error::InvalidPlatformFee);
        }
        admin::write_admin(&e, &admin);
        e.storage().instance().set(&DataKey::Token, &token);
        e.storage().instance().set(&DataKey::Treasury, &treasury);
        e.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        extend_instance_ttl(&e);
        Ok(())
    }

    fn register_user(e: Env, user: Address, username: String, profile_cid: String) -> Result<(), Error> {
        user.require_auth();
        extend_instance_ttl(&e);
        let key = DataKey::User(user.clone());
        if e.storage().persistent().has(&key) {
            return Err(Error::UserAlreadyRegistered);
        }
        let new_user = User {
            address: user.clone(),
            username,
            xp: 0,
            wins: 0,
            losses: 0,
            rank_points: 0,
            profile_cid,
        };
        e.storage().persistent().set(&key, &new_user);
        e.storage().persistent().extend_ttl(&key, PERSISTENT_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT);
        Ok(())
    }

    fn get_user(e: Env, user: Address) -> Option<User> {
        let key = DataKey::User(user);
        e.storage().persistent().get(&key)
    }

    fn update_profile(e: Env, user: Address, profile_cid: String) -> Result<(), Error> {
        user.require_auth();
        extend_instance_ttl(&e);
        let key = DataKey::User(user.clone());
        if let Some(mut user_data) = e.storage().persistent().get::<_, User>(&key) {
            user_data.profile_cid = profile_cid;
            e.storage().persistent().set(&key, &user_data);
            e.storage().persistent().extend_ttl(&key, PERSISTENT_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT);
            Ok(())
        } else {
            Err(Error::UserNotRegistered)
        }
    }

    fn create_match(e: Env, entry_fee: i128, topic_cid: String, user: Address, join_deadline: u64, roast_deadline: u64, vote_end: u64) -> Result<u32, Error> {
        user.require_auth();
        extend_instance_ttl(&e);
        
        let token_addr: Address = e.storage().instance().get(&DataKey::Token).ok_or(Error::NotInitialized)?;
        
        if entry_fee <= 0 {
            return Err(Error::InvalidFee);
        }
        
        let now = e.ledger().timestamp();
        if join_deadline <= now || roast_deadline <= join_deadline || vote_end <= roast_deadline {
            return Err(Error::DeadlinePassed);
        }

        // Transfer entry fee from creator to contract
        let token_client = token::Client::new(&e, &token_addr);
        token_client.transfer(&user, &e.current_contract_address(), &entry_fee);

        let key = DataKey::MatchCount;
        let match_count: u32 = e.storage().instance().get(&key).unwrap_or(0);
        let new_match_id = match_count + 1;
        e.storage().instance().set(&key, &new_match_id);

        let match_key = DataKey::Match(new_match_id);
        let new_match = Match {
            match_id: new_match_id,
            creator: user.clone(),
            player1: user.clone(),
            player2: None,
            entry_fee,
            topic_cid,
            roast1_cid: None,
            roast2_cid: None,
            status: MatchStatus::Open,
            winner: None,
            votes_player1: 0,
            votes_player2: 0,
            created_at: now,
            join_deadline,
            roast_deadline,
            vote_end,
        };
        e.storage().persistent().set(&match_key, &new_match);
        e.storage().persistent().extend_ttl(&match_key, PERSISTENT_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT);

        events::match_created(&e, new_match_id, &user, entry_fee);

        Ok(new_match_id)
    }

    fn join_match(e: Env, match_id: u32, player: Address) -> Result<(), Error> {
        player.require_auth();
        extend_instance_ttl(&e);

        let key = DataKey::Match(match_id);
        let mut match_data = e.storage().persistent().get::<_, Match>(&key).ok_or(Error::MatchNotFound)?;

        if match_data.status != MatchStatus::Open {
            return Err(Error::MatchNotOpen);
        }
        if match_data.player1 == player {
            return Err(Error::CannotJoinOwnMatch);
        }
        if e.ledger().timestamp() > match_data.join_deadline {
            return Err(Error::DeadlinePassed);
        }

        let join_key = DataKey::HasJoined(player.clone(), match_id);
        if e.storage().persistent().has(&join_key) {
            return Err(Error::AlreadyJoined);
        }
        let p1_key = DataKey::HasJoined(match_data.player1.clone(), match_id);
        if !e.storage().persistent().has(&p1_key) {
            e.storage().persistent().set(&p1_key, &true);
            e.storage().persistent().extend_ttl(&p1_key, PERSISTENT_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT);
        }

        // Transfer entry fee
        let token_addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&e, &token_addr);
        token_client.transfer(&player, &e.current_contract_address(), &match_data.entry_fee);

        e.storage().persistent().set(&join_key, &true);
        e.storage().persistent().extend_ttl(&join_key, PERSISTENT_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT);
        
        match_data.player2 = Some(player.clone());
        match_data.status = MatchStatus::Active;
        e.storage().persistent().set(&key, &match_data);
        e.storage().persistent().extend_ttl(&key, PERSISTENT_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT);

        events::match_joined(&e, match_id, &player);

        Ok(())
    }

    fn submit_roast(e: Env, match_id: u32, roast_cid: String, player: Address) -> Result<(), Error> {
        player.require_auth();
        extend_instance_ttl(&e);

        let key = DataKey::Match(match_id);
        let mut match_data = e.storage().persistent().get::<_, Match>(&key).ok_or(Error::MatchNotFound)?;

        if match_data.status != MatchStatus::Active {
            return Err(Error::MatchNotActive);
        }
        if e.ledger().timestamp() > match_data.roast_deadline {
            return Err(Error::DeadlinePassed);
        }

        let is_p1 = match_data.player1 == player;
        let is_p2 = match_data.player2 == Some(player.clone());

        if !is_p1 && !is_p2 {
            return Err(Error::NotParticipant);
        }

        if is_p1 {
            if match_data.roast1_cid.is_some() {
                return Err(Error::RoastAlreadySubmitted);
            }
            match_data.roast1_cid = Some(roast_cid.clone());
        }
        if is_p2 {
            if match_data.roast2_cid.is_some() {
                return Err(Error::RoastAlreadySubmitted);
            }
            match_data.roast2_cid = Some(roast_cid);
        }

        e.storage().persistent().set(&key, &match_data);
        e.storage().persistent().extend_ttl(&key, PERSISTENT_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT);
        
        events::roast_submitted(&e, match_id, &player);

        Ok(())
    }

    fn vote(e: Env, match_id: u32, selected_player: Address, voter: Address) -> Result<(), Error> {
        voter.require_auth();
        extend_instance_ttl(&e);

        let key = DataKey::Match(match_id);
        let mut match_data = e.storage().persistent().get::<_, Match>(&key).ok_or(Error::MatchNotFound)?;

        if match_data.status != MatchStatus::Active {
            return Err(Error::MatchNotActive);
        }
        
        let now = e.ledger().timestamp();
        if now <= match_data.roast_deadline || now > match_data.vote_end {
            return Err(Error::DeadlinePassed);
        }

        // Verify voter is a registered user
        let user_key = DataKey::User(voter.clone());
        if !e.storage().persistent().has(&user_key) {
            return Err(Error::UserNotRegistered);
        }

        if match_data.player1 == voter || match_data.player2 == Some(voter.clone()) {
            return Err(Error::CannotVoteOwnMatch);
        }

        let vote_key = DataKey::HasVoted(voter.clone(), match_id);
        if e.storage().persistent().has(&vote_key) {
            return Err(Error::AlreadyVoted);
        }
        e.storage().persistent().set(&vote_key, &true);
        e.storage().persistent().extend_ttl(&vote_key, PERSISTENT_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT);

        let valid_p1 = match_data.player1 == selected_player;
        let valid_p2 = match_data.player2 == Some(selected_player.clone());

        if !valid_p1 && !valid_p2 {
            return Err(Error::InvalidPlayerSelected);
        }

        if valid_p1 {
            match_data.votes_player1 += 1;
        }
        if valid_p2 {
            match_data.votes_player2 += 1;
        }

        e.storage().persistent().set(&key, &match_data);
        e.storage().persistent().extend_ttl(&key, PERSISTENT_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT);

        events::voted(&e, match_id, &voter, &selected_player);

        Ok(())
    }

    fn predict(e: Env, match_id: u32, selected_player: Address, amount: i128, predictor: Address) -> Result<(), Error> {
        predictor.require_auth();
        extend_instance_ttl(&e);

        if amount <= 0 {
            return Err(Error::PredictionAmountInvalid);
        }

        let key = DataKey::Match(match_id);
        let match_data = e.storage().persistent().get::<_, Match>(&key).ok_or(Error::MatchNotFound)?;

        if match_data.status != MatchStatus::Active {
            return Err(Error::MatchNotActive);
        }
        if e.ledger().timestamp() > match_data.roast_deadline {
            return Err(Error::DeadlinePassed);
        }

        let prediction_key = DataKey::Prediction(match_id, predictor.clone());
        if e.storage().persistent().has(&prediction_key) {
            return Err(Error::AlreadyPredicted);
        }

        // Transfer prediction stake
        let token_addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&e, &token_addr);
        token_client.transfer(&predictor, &e.current_contract_address(), &amount);

        let prediction = Prediction {
            predictor: predictor.clone(),
            selected_player: selected_player.clone(),
            amount,
            claimed: false,
        };
        e.storage().persistent().set(&prediction_key, &prediction);
        e.storage().persistent().extend_ttl(&prediction_key, PERSISTENT_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT);

        events::predicted(&e, match_id, &predictor, &selected_player, amount);

        Ok(())
    }

    fn finalize_match(e: Env, match_id: u32) -> Result<(), Error> {
        extend_instance_ttl(&e);

        let key = DataKey::Match(match_id);
        let mut match_data = e.storage().persistent().get::<_, Match>(&key).ok_or(Error::MatchNotFound)?;

        if match_data.status == MatchStatus::Ended || match_data.status == MatchStatus::Draw || match_data.status == MatchStatus::Canceled {
            return Err(Error::MatchAlreadyFinalized);
        }
        if match_data.status != MatchStatus::Active {
            return Err(Error::MatchNotActive);
        }
        
        let now = e.ledger().timestamp();
        
        // Finalize logic - allows finalizing early if someone calls it, but usually called after vote_end
        // If not both roasts submitted by roast deadline, the one who didn't submit loses.
        // For simplicity right now, if vote_end hasn't passed, both roasts MUST be submitted to even consider finalizing manually (or maybe not at all manually unless admin)
        if now <= match_data.vote_end {
           return Err(Error::VoteDeadlineNotPassed); 
        }

        if match_data.roast1_cid.is_none() || match_data.roast2_cid.is_none() {
            // Technically a forfeit. We'll handle properly in advanced version. For now, strict check if we assume valid play.
            // If someone forfeited, they lose automatically. Let's add that logic.
            if match_data.roast1_cid.is_none() && match_data.roast2_cid.is_some() {
                 match_data.votes_player2 = 999999; // P1 forfeit
            } else if match_data.roast2_cid.is_none() && match_data.roast1_cid.is_some() {
                 match_data.votes_player1 = 999999; // P2 forfeit
            } else {
                 // Both forfeit -> draw
                 match_data.status = MatchStatus::Draw;
                 match_data.winner = None;
                 e.storage().persistent().set(&key, &match_data);
                 events::finalized(&e, match_id, &None);
                 return Ok(());
            }
        }

        if match_data.votes_player1 == match_data.votes_player2 {
            match_data.status = MatchStatus::Draw;
            match_data.winner = None;
            e.storage().persistent().set(&key, &match_data);
            e.storage().persistent().extend_ttl(&key, PERSISTENT_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT);
            events::finalized(&e, match_id, &None);
            return Ok(());
        }

        let winner: Address = if match_data.votes_player1 > match_data.votes_player2 {
            match_data.player1.clone()
        } else {
            match_data.player2.clone().ok_or(Error::Player2Missing)?
        };

        // Payout winner
        let total_pot = match_data.entry_fee * 2;
        let fee_bps: u32 = e.storage().instance().get(&DataKey::FeeBps).unwrap_or(250);
        let fee_amount = (total_pot * fee_bps as i128) / 10000;
        let winner_payout = total_pot - fee_amount;

        let token_addr: Address = e.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&e, &token_addr);
        
        let treasury: Address = e.storage().instance().get(&DataKey::Treasury).unwrap();
        
        token_client.transfer(&e.current_contract_address(), &treasury, &fee_amount);
        token_client.transfer(&e.current_contract_address(), &winner, &winner_payout);

        // We skip full user stats updating here to save lines, backend will index events and update DB stats 
        // to avoid expensive and large persistent storage writes for simple stats if needed, 
        // OR we can keep it. I'll omit badge/stats logic in the contract for brevity, focusing on ESCROW.

        match_data.winner = Some(winner.clone());
        match_data.status = MatchStatus::Ended;
        e.storage().persistent().set(&key, &match_data);
        e.storage().persistent().extend_ttl(&key, PERSISTENT_BUMP_AMOUNT, PERSISTENT_BUMP_AMOUNT);

        events::finalized(&e, match_id, &Some(winner.clone()));
        events::payout(&e, match_id, &winner, winner_payout);

        Ok(())
    }
}
