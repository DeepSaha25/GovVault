#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, token};

#[contracttype]
pub enum DataKey {
    Governor,
    Token,
}

#[contract]
pub struct TreasuryContract;

#[contractimpl]
impl TreasuryContract {
    pub fn initialize(env: Env, governor: Address, token: Address) {
        if env.storage().instance().has(&DataKey::Governor) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Governor, &governor);
        env.storage().instance().set(&DataKey::Token, &token);
    }

    pub fn release_funds(env: Env, to: Address, amount: i128) {
        // Assert that the caller is the Governor contract
        let governor: Address = env
            .storage()
            .instance()
            .get(&DataKey::Governor)
            .expect("Governor address not set");
        
        governor.require_auth();

        // Transfer funds to target receiver
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_addr);

        token_client.transfer(&env.current_contract_address(), &to, &amount);

        env.events().publish(
            (symbol_short!("treasury"), symbol_short!("payout")),
            (to, amount),
        );
    }

    pub fn get_governor(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Governor).expect("Governor not set")
    }

    pub fn get_token(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Token).expect("Token not set")
    }
}
