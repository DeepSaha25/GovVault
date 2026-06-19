# 🏛️ GovVault — DAO Governance with Quadratic Voting & Treasury Executor

GovVault is a decentralized governance and funding platform built on **Stellar Soroban**. It enforces a fair voting mechanism called **Quadratic Voting** to protect decentralized organizations from plutocratic (whale-dominated) outcomes and utilizes a **Timelocked Treasury Executor** to lock and safely release funding allocations on-chain.

### 🔴 The Problem
Traditional decentralized autonomous organization (DAO) governance and treasury management face critical vulnerabilities:
- **Plutocratic Dominance (Whale Control)**: Standard token-weighted voting systems ($1 \text{ token} = 1 \text{ vote}$) allow wealthy "whales" to easily override the majority community's preferences, centralizing power and silencing minority contributors.
- **Treasury Vulnerability (Hostile Takeovers)**: Many governance systems execute funding payouts immediately upon proposal completion. This makes DAOs vulnerable to sudden governance takeovers, exploit proposals, or malicious drainages before the community can react.
- **High Fees for Decentralized Action**: Executing complex governance rules and multiple token voting options on L1 blockchains can cost users massive gas fees, discouraging participation.

### 🟢 The Solution
GovVault addresses these inefficiencies by leveraging Stellar’s ultra-low fees and Soroban’s smart contract interoperability:
- **On-Chain Quadratic Voting**: Governs with a cost scale of $cost = \text{votes}^2$ (e.g., 1 vote costs 1 token, 5 votes cost 25 tokens). This curbs whale dominance by making concentrated votes exponentially expensive, balancing power towards broad community consensus.
- **Timelocked Treasury Executor (ICC)**: Implements split-contract security. Upon proposal approval, the Governor contract calls the Treasury contract via Inter-Contract Communication (ICC) to timelock the funds. This delay provides a critical security buffer for the community to inspect, veto, or freeze the allocation if a malicious takeover is detected.
- **Frictionless Governance**: Capitalizes on Stellar’s speed and near-zero transaction fees to enable active, low-cost community-driven decision-making and micro-grant funding at scale.

---

## 🚀 Deployed Testnet Specifications

*   **Governor Contract Address**: `CB56DGFX43XUXN2OASKM3SF6I3WWNYUM6KE7HKUKX3JSLZPYQSRQXOHH`
*   **Treasury Contract Address**: `CBAFHUW7TL73RG4KYSL53ZF4N4NCJK76KXL3NHKEDDWE2GPVHA52LJ47`
*   **Inter-Contract Link Transaction Hash**: `7fb488cc3a32f6b3e7ff7de9ef652a921d743a129de9d28bc9ef2816ccb21f3a`
*   **Stellar Network**: Testnet

---

## 🌟 Progressive Deliverables (Level 1, 2, and 3)

### 👛 Level 1: Wallet Connection & Payments
- **Wallet Bridging**: Direct integration with Freighter, xBull, and Albedo wallets via the Stellar Wallets Kit.
- **Balance Polling**: Real-time balance fetching in native XLM to keep UI synchronized with the ledger.
- **Direct XLM Transfer (`/transfer`)**: Secure, validated transfer module supporting recipient address check, amount validation, and explorer links.

### ⛓️ Level 2: Inter-Contract State Machine
- **Governor Contract (`governor-contract`)**: Controls voting weight, computes quadratic vote token costs on-chain, tracks proposal states, and triggers execution.
- **Treasury Contract (`treasury-contract`)**: Holds community funds and locks payment releases until verified by cross-contract calls from the Governor.
- **Dynamic Portal (`/dashboard`)**: Forum-style dashboard listing proposal states (Active ➔ Passed ➔ Executed/Failed) with active status badges.

### 📡 Level 3: Real-time Streams, CI/CD, and Verification
- **Real-time Event Log**: Dynamic stream pulling event topics and values directly from Soroban RPC ledger logs.
- **CI/CD Pipeline (`ci.yml`)**: Automated GitHub Actions workflow compiling Rust contracts, running cargo tests, running frontend Vitest tests, and validating Next.js builds.
- **Test Coverage**:
  - **Cargo Contract Tests**: 1 passing test checking proposal creation, quadratic voting weight deductions, and timelocked payouts.
  - **Vitest Suite**: 12 passing tests verifying utility helper conversions and key UI components.

---

## 🛠️ Technology Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS (Monochromatic zinc dark-mode theme)
- **Contracts**: Rust (Soroban SDK `22.0.11`)
- **Stellar Integration**: `@stellar/stellar-sdk` & `@creit.tech/stellar-wallets-kit`
- **Testing**: Vitest + JSDOM for frontend; Cargo test for Rust contracts

---

## 💻 Local Installation & Getting Started

### 📋 Prerequisites
- Node.js 18+ or 20+
- Cargo + Rust Toolchain (with `wasm32-unknown-unknown` target)
- Freighter Wallet extension installed

### 🛠️ Step-by-Step Setup

1. **Navigate to the GovVault Directory**:
   ```bash
   cd "level 3\GovVault"
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file in the root with the following configuration:
   ```env
   NEXT_PUBLIC_GOVERNOR_CONTRACT_ID=CB56DGFX43XUXN2OASKM3SF6I3WWNYUM6KE7HKUKX3JSLZPYQSRQXOHH
   NEXT_PUBLIC_TREASURY_CONTRACT_ID=CBAFHUW7TL73RG4KYSL53ZF4N4NCJK76KXL3NHKEDDWE2GPVHA52LJ47
   NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-rpc.testnet.stellar.org
   ```

3. **Install Dependencies**:
   ```bash
   npm install --ignore-scripts
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Run the Test Suite**:
   *   **Frontend Tests**: `npm run test`
   *   **Rust Contract Tests**:
       ```bash
       cd contracts/governor-contract && cargo test
       ```

---

## 📄 License
This project is licensed under the MIT License.
