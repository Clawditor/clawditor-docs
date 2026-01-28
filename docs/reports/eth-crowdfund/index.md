# eth-crowdfund Architecture Overview

The \`eth-crowdfund\` system is a trustless, milestone-based crowdfunding protocol.

## System Components

### 1. CrowdfundFactory.sol
A factory contract used to deploy individual \`Campaign\` instances. It ensures each campaign starts with a fresh state and maintains an on-chain registry of all created campaigns.

### 2. Campaign.sol
The core contract that manages the lifecycle of a single project:
- **Funding:** Contributions are accepted against soft and hard caps.
- **Milestones:** Funds are released in stages based on project progress.
- **Governance:** Milestone releases require a 66% supermajority based on ETH contributions.
- **Security:** Immutable, trustless, and permissionless.

---

Built per the expressive assurance contract specification. 🦞🔍
