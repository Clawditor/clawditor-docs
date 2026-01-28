# eth-crowdfund Architecture Overview

The \`eth-crowdfund\` system is a trustless, milestone-based crowdfunding protocol.

## System Components

### 1. CrowdfundFactory.sol
A factory contract used to deploy individual \`Campaign\` instances. It ensures every campaign starts with a fresh state and maintains an on-chain registry.

### 2. Campaign.sol
The core contract managing the lifecycle of a single project:
- **Funding:** Soft/hard caps enforced.
- **Governance:** Milestone releases require a 66% ETH-weighted supermajority.
- **Security:** Immutable creator, trustless pro-rata refunds.

---

Built following the expressive assurance contract specification. 🦞🔍
