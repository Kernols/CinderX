use soroban_sdk::{symbol_short, Address, Env, Symbol};

pub fn match_created(e: &Env, match_id: u32, creator: &Address, entry_fee: i128) {
    let topics = (symbol_short!("created"), match_id, creator.clone());
    e.events().publish(topics, entry_fee);
}

pub fn match_joined(e: &Env, match_id: u32, player2: &Address) {
    let topics = (symbol_short!("joined"), match_id, player2.clone());
    e.events().publish(topics, ());
}

pub fn roast_submitted(e: &Env, match_id: u32, player: &Address) {
    let topics = (symbol_short!("roast"), match_id, player.clone());
    e.events().publish(topics, ());
}

pub fn voted(e: &Env, match_id: u32, voter: &Address, selected_player: &Address) {
    let topics = (symbol_short!("voted"), match_id, voter.clone());
    e.events().publish(topics, selected_player.clone());
}

pub fn predicted(e: &Env, match_id: u32, predictor: &Address, selected_player: &Address, amount: i128) {
    let topics = (symbol_short!("predicted"), match_id, predictor.clone());
    e.events().publish(topics, (selected_player.clone(), amount));
}

pub fn finalized(e: &Env, match_id: u32, winner: &Option<Address>) {
    let topics = (symbol_short!("finalized"), match_id);
    e.events().publish(topics, winner.clone());
}

pub fn payout(e: &Env, match_id: u32, recipient: &Address, amount: i128) {
    let topics = (symbol_short!("payout"), match_id, recipient.clone());
    e.events().publish(topics, amount);
}

pub fn match_canceled(e: &Env, match_id: u32) {
    let topics = (symbol_short!("canceled"), match_id);
    e.events().publish(topics, ());
}

pub fn refunded(e: &Env, match_id: u32, player: &Address, amount: i128) {
    let topics = (symbol_short!("refunded"), match_id, player.clone());
    e.events().publish(topics, amount);
}

pub fn prediction_claimed(e: &Env, match_id: u32, predictor: &Address, amount: i128) {
    let topics = (Symbol::new(e, "claimed"), match_id, predictor.clone());
    e.events().publish(topics, amount);
}
