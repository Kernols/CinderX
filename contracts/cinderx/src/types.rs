use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum MatchStatus {
    Open,
    Active,
    Ended,
    Draw,
    Canceled,
}

#[contracttype]
#[derive(Clone)]
pub struct User {
    pub address: Address,
    pub username: String,
    pub xp: u32,
    pub wins: u32,
    pub losses: u32,
    pub rank_points: u32,
    pub profile_cid: String,
}

#[contracttype]
#[derive(Clone)]
pub struct Match {
    pub match_id: u32,
    pub creator: Address,
    pub player1: Address,
    pub player2: Option<Address>,
    pub entry_fee: i128,
    pub topic_cid: String,
    pub roast1_cid: Option<String>,
    pub roast2_cid: Option<String>,
    pub status: MatchStatus,
    pub winner: Option<Address>,
    pub votes_player1: u32,
    pub votes_player2: u32,
    pub created_at: u64,
    pub join_deadline: u64,
    pub roast_deadline: u64,
    pub vote_end: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Prediction {
    pub predictor: Address,
    pub selected_player: Address,
    pub amount: i128,
    pub claimed: bool,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum Badge {
    FirstWin,
    FiveWins,
    TenMatches,
}
