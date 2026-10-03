use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env, String};
use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::token::StellarAssetClient as TokenAdminClient;
use crate::{CinderX, CinderXClient, types::MatchStatus};

fn create_token_contract<'a>(e: &Env, admin: &Address) -> (TokenClient<'a>, TokenAdminClient<'a>) {
    let contract_address = e.register_stellar_asset_contract_v2(admin.clone());
    (
        TokenClient::new(e, &contract_address.address()),
        TokenAdminClient::new(e, &contract_address.address()),
    )
}

#[test]
fn test_full_match_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let (token, token_admin) = create_token_contract(&env, &admin);

    let contract_id = env.register(CinderX, ());
    let client = CinderXClient::new(&env, &contract_id);

    // Initialize
    client.initialize(&admin, &token.address, &treasury, &250);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let voter = Address::generate(&env);

    // Mint tokens
    token_admin.mint(&user1, &1000);
    token_admin.mint(&user2, &1000);

    client.register_user(&user1, &String::from_str(&env, "u1"), &String::from_str(&env, "cid1"));
    client.register_user(&user2, &String::from_str(&env, "u2"), &String::from_str(&env, "cid2"));
    client.register_user(&voter, &String::from_str(&env, "v1"), &String::from_str(&env, "cid3"));

    env.ledger().set_timestamp(100);

    let entry_fee = 100i128;
    let topic_cid = String::from_str(&env, "topic");
    let join_deadline = 200;
    let roast_deadline = 300;
    let vote_end = 400;

    let match_id = client.create_match(&entry_fee, &topic_cid, &user1, &join_deadline, &roast_deadline, &vote_end);
    assert_eq!(token.balance(&user1), 900);
    assert_eq!(token.balance(&contract_id), 100);

    client.join_match(&match_id, &user2);
    assert_eq!(token.balance(&user2), 900);
    assert_eq!(token.balance(&contract_id), 200);

    client.submit_roast(&match_id, &String::from_str(&env, "r1"), &user1);
    client.submit_roast(&match_id, &String::from_str(&env, "r2"), &user2);

    env.ledger().set_timestamp(350); // After roast, before vote end
    client.vote(&match_id, &user1, &voter);

    env.ledger().set_timestamp(450); // After vote end
    client.finalize_match(&match_id);

    // Winner gets pot minus 2.5% fee
    // Pot = 200. Fee = 5. Winner gets 195.
    // User1 balance = 900 + 195 = 1095
    assert_eq!(token.balance(&user1), 1095);
    assert_eq!(token.balance(&treasury), 5);
    assert_eq!(token.balance(&contract_id), 0);
}
