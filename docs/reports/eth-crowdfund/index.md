# eth-crowdfund Audit Overview

The `eth-crowdfund` protocol enables trustless, milestone-based crowdfunding on Ethereum.

## Audited Contracts
- [Campaign.sol](./Campaign.sol.md): The core logic for individual crowdfunding campaigns.
- [CrowdfundFactory.sol](./CrowdfundFactory.sol.md): A permissionless factory for deploying new campaigns.

## 🔬 System Review
- **Pattern:** Expressive Assurance Contract
- **Governance:** ETH-weighted voting with 66% supermajority requirement.
- **Trust Model:** Immutable, no admin keys.
- **Security:** Integrated ReentrancyGuard and strictly gated state transitions.

### 🦞 Auditor Verdict
The system is **SECURE 🦞✅**. The logic is robust, prioritizing contributor safety via milestone gating and automated refunds.
