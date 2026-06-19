#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Env, IntoVal};
use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::token::StellarAssetClient as TokenAdminClient;

// Define the client interfaces
struct TestGovernorClient<'a> {
    env: &'a Env,
    contract_id: Address,
    client: GovernorContractClient<'a>,
}

fn setup_test_env(env: &Env) -> (Address, Address, Address, Address) {
    // 1. Create test actors
    let proposer = Address::generate(env);
    let voter = Address::generate(env);
    let target = Address::generate(env);

    // 2. Deploy a mock token
    let token_admin = Address::generate(env);
    let token_id = env.register_stellar_asset_contract(token_admin.clone());
    let token_client = TokenClient::new(env, &token_id);
    let token_admin_client = TokenAdminClient::new(env, &token_id);

    // Mint tokens to voter
    token_admin_client.mint(&voter, &1000);

    // 3. Deploy Governor and Treasury
    let governor_id = env.register_contract(None, GovernorContract);
    let governor_client = GovernorContractClient::new(env, &governor_id);

    // Deploy Treasury using direct struct registration
    let treasury_id = env.register_contract(None, treasury_contract::TreasuryContract);
    let treasury_client = treasury_contract::TreasuryContractClient::new(env, &treasury_id);

    // 4. Initialize contracts
    governor_client.initialize(&treasury_id, &token_id);
    treasury_client.initialize(&governor_id, &token_id);

    // Mint funds to the treasury contract directly
    token_admin_client.mint(&treasury_id, &5000);

    (proposer, voter, target, governor_id)
}

#[test]
fn test_proposal_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let (proposer, voter, target, governor_id) = setup_test_env(&env);
    let gov_client = GovernorContractClient::new(&env, &governor_id);

    // 1. Create proposal
    let title = String::from_str(&env, "Grant #1");
    let desc = String::from_str(&env, "Community Treasury Funding");
    let amount = 500i128;

    let proposal_id = gov_client.create_proposal(
        &proposer,
        &title,
        &desc,
        &target,
        &amount,
    );

    assert_eq!(proposal_id, 1);

    // Check proposal details
    let proposal = gov_client.get_proposal(&proposal_id);
    assert_eq!(proposal.yes_votes, 0);
    assert_eq!(proposal.no_votes, 0);
    assert_eq!(proposal.status, 0); // Active

    // 2. Vote (Quadratic Voting: 3 votes costs 9 tokens)
    gov_client.vote(&voter, &proposal_id, &3i128, &true);

    let proposal_updated = gov_client.get_proposal(&proposal_id);
    assert_eq!(proposal_updated.yes_votes, 3);
    assert_eq!(proposal_updated.no_votes, 0);

    // Check voter balance after voting (1000 - 9 = 991)
    let proposal_data = gov_client.get_proposal(&proposal_id);
    assert_eq!(proposal_data.status, 0); // Active

    // 3. Fast-forward ledger to end voting
    env.ledger().with_mut(|li| {
        li.timestamp += 90000; // end_time is +86400
    });

    // 4. Check result
    gov_client.check_proposal_result(&proposal_id);
    let proposal_passed = gov_client.get_proposal(&proposal_id);
    assert_eq!(proposal_passed.status, 1); // Passed & Timelocked

    // 5. Fast-forward past execution timelock (timelock is +60s)
    env.ledger().with_mut(|li| {
        li.timestamp += 100;
    });

    // 6. Execute proposal
    gov_client.execute_proposal(&proposal_id);

    let proposal_executed = gov_client.get_proposal(&proposal_id);
    assert_eq!(proposal_executed.status, 3); // Executed
}
