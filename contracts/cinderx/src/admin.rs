use soroban_sdk::{Address, Env};
use crate::storage::DataKey;

pub fn has_admin(e: &Env) -> bool {
    let key = DataKey::Admin;
    e.storage().instance().has(&key)
}

pub fn read_admin(e: &Env) -> Address {
    let key = DataKey::Admin;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_admin(e: &Env, id: &Address) {
    let key = DataKey::Admin;
    e.storage().instance().set(&key, id);
}

pub fn check_admin(e: &Env, id: &Address) {
    id.require_auth();
    if id != &read_admin(e) {
        panic!("Unauthorized");
    }
}
