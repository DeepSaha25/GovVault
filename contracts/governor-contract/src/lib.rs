#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, token};

#[derive(Clone)]
#[contracttype]
pub struct Proposal {
    pub id: u32,
    pub proposer: Address,
    pub title: String,
    pub description: String,
    pub target: Address,
    pub amount: i128,
    pub yes_votes: i128,
    pub no_votes: i128,
    pub status: u32, // 0 = Active, 1 = Passed, 2 = Failed, 3 = Executed
    pub end_time: u64,
    pub execution_time: u64,
}

#[contracttype]
pub enum DataKey {
    Treasury,
    Token,
    ProposalCount,
    Proposals(u32),
    Voted(u32, Address),
}

#[contract]
pub struct GovernorContract;

// Define the client interface for TreasuryContract to allow inter-contract calls
mod treasury {
    use soroban_sdk::{Address, Env, IntoVal, Symbol, vec};
    pub struct Client<'a> {
        pub env: &'a Env,
        pub address: Address,
    }
    impl<'a> Client<'a> {
        pub fn new(env: &'a Env, address: &Address) -> Self {
            Self { env, address: address.clone() }
        }
        pub fn release_funds(&self, to: &Address, amount: &i128) {
            self.env.invoke_contract::<()>(
                &self.address,
                &Symbol::new(self.env, "release_funds"),
                vec![self.env, to.into_val(self.env), amount.into_val(self.env)],
            );
        }
    }
}

#[contractimpl]
impl GovernorContract {
    pub fn initialize(env: Env, treasury: Address, token: Address) {
        if env.storage().instance().has(&DataKey::Treasury) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::ProposalCount, &0u32);
    }

    pub fn create_proposal(
        env: Env,
        proposer: Address,
        title: String,
        description: String,
        target: Address,
        amount: i128,
    ) -> u32 {
        proposer.require_auth();

        let mut count: u32 = env.storage().instance().get(&DataKey::ProposalCount).unwrap_or(0);
        count += 1;

        let end_time = env.ledger().timestamp() + 300; // 5 minute voting period for testnet demo
        let proposal = Proposal {
            id: count,
            proposer,
            title,
            description,
            target,
            amount,
            yes_votes: 0,
            no_votes: 0,
            status: 0, // Active
            end_time,
            execution_time: 0,
        };

        env.storage().persistent().set(&DataKey::Proposals(count), &proposal);
        env.storage().instance().set(&DataKey::ProposalCount, &count);

        env.events().publish(
            (symbol_short!("proposal"), count),
            symbol_short!("created"),
        );

        count
    }

    pub fn vote(env: Env, voter: Address, proposal_id: u32, votes: i128, approve: bool) {
        voter.require_auth();

        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposals(proposal_id))
            .expect("Proposal not found");

        if env.ledger().timestamp() >= proposal.end_time {
            panic!("Voting period has ended");
        }

        if proposal.status != 0 {
            panic!("Proposal is not active");
        }

        // Check if user has already voted
        let voted_key = DataKey::Voted(proposal_id, voter.clone());
        if env.storage().persistent().has(&voted_key) {
            panic!("Voter already voted on this proposal");
        }

        // Quadratic cost: cost = votes * votes
        let cost = votes.checked_mul(votes).expect("Cost overflow");
        if cost <= 0 {
            panic!("Must vote with at least 1 vote");
        }

        // Transfer voting token cost to the treasury contract
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_addr);
        let treasury_addr: Address = env.storage().instance().get(&DataKey::Treasury).unwrap();

        token_client.transfer(&voter, &treasury_addr, &cost);

        if approve {
            proposal.yes_votes += votes;
        } else {
            proposal.no_votes += votes;
        }

        env.storage().persistent().set(&DataKey::Proposals(proposal_id), &proposal);
        env.storage().persistent().set(&voted_key, &true);

        env.events().publish(
            (symbol_short!("vote"), proposal_id),
            (voter, votes, approve),
        );
    }

    pub fn check_proposal_result(env: Env, proposal_id: u32) {
        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposals(proposal_id))
            .expect("Proposal not found");

        if env.ledger().timestamp() < proposal.end_time {
            panic!("Voting period is still active");
        }

        if proposal.status != 0 {
            panic!("Proposal result already evaluated");
        }

        if proposal.yes_votes > proposal.no_votes {
            proposal.status = 1; // Passed & Timelocked
            proposal.execution_time = env.ledger().timestamp() + 60; // 1-minute timelock for testing/demo (originally 24 hours)
        } else {
            proposal.status = 2; // Failed
        }

        env.storage().persistent().set(&DataKey::Proposals(proposal_id), &proposal);

        env.events().publish(
            (symbol_short!("proposal"), proposal_id),
            proposal.status,
        );
    }

    pub fn execute_proposal(env: Env, proposal_id: u32) {
        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&DataKey::Proposals(proposal_id))
            .expect("Proposal not found");

        if proposal.status != 1 {
            panic!("Proposal has not passed or is already executed");
        }

        if env.ledger().timestamp() < proposal.execution_time {
            panic!("Timelock period is still active");
        }

        proposal.status = 3; // Executed
        env.storage().persistent().set(&DataKey::Proposals(proposal_id), &proposal);

        // Perform cross-contract call to Treasury
        let treasury_addr: Address = env.storage().instance().get(&DataKey::Treasury).unwrap();
        let treasury_client = treasury::Client::new(&env, &treasury_addr);

        // Governor calls Treasury's release_funds
        treasury_client.release_funds(&proposal.target, &proposal.amount);

        env.events().publish(
            (symbol_short!("proposal"), proposal_id),
            symbol_short!("executed"),
        );
    }

    pub fn get_proposal(env: Env, proposal_id: u32) -> Proposal {
        env.storage()
            .persistent()
            .get(&DataKey::Proposals(proposal_id))
            .expect("Proposal not found")
    }

    pub fn get_proposal_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::ProposalCount).unwrap_or(0)
    }
}

mod test;

