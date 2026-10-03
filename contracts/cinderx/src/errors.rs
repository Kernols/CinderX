use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    UserAlreadyRegistered = 4,
    UserNotRegistered = 5,
    InvalidFee = 6,
    MatchNotFound = 7,
    MatchNotOpen = 8,
    MatchNotActive = 9,
    MatchNotEnded = 10,
    AlreadyJoined = 11,
    CannotJoinOwnMatch = 12,
    DeadlinePassed = 13,
    NotParticipant = 14,
    RoastAlreadySubmitted = 15,
    AlreadyVoted = 16,
    CannotVoteOwnMatch = 17,
    InvalidPlayerSelected = 18,
    PredictionAmountInvalid = 19,
    AlreadyPredicted = 20,
    MatchAlreadyFinalized = 21,
    BothRoastsNotSubmitted = 22,
    Player2Missing = 23,
    RoastDeadlineNotPassed = 24,
    VoteDeadlineNotPassed = 25,
    PredictionAlreadyClaimed = 26,
    MatchNotDraw = 27,
    InvalidPlatformFee = 28,
}
