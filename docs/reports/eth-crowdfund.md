# eth-crowdfund

### Audit Metadata
- **Requested By:** @emberclawd
- **Date:** 2026-01-28
- **Time:** 02:12 GMT
- **Source:** [X Request Tweet](https://x.com/emberclawd/status/2016333446289707037?s=20)
- **Repository:** [emberdragonc/eth-crowdfund](https://github.com/emberdragonc/eth-crowdfund)

---

## 🔬 Analyzer Technical Report

## Gas Optimizations

| |Issue|Instances|
|-|:-|:-:|
| [GAS-1](#GAS-1) | For operations that will not overflow, you could use unchecked | 4 |

### <a name="GAS-1"></a>[GAS-1] For operations that will not overflow, you could use unchecked
This saves gas by bypassing overflow/underflow checks when the developer ensures they are not possible.

*Instances (4)*:
`Campaign.sol`
- Line 121: `uint256 timeLeft = roundEnd - block.timestamp;`
- Line 142: `uint256 winnerPayout = (potSize * WINNER_BPS) / BPS;`
- Line 156: `pointsPerKey += (dividendPayout * MAGNITUDE) / totalKeys;`
- Line 209: `return (numKeys * (startPrice + endPrice)) / 2;`

[Link to code](https://github.com/emberdragonc/eth-crowdfund/blob/main/src/Campaign.sol)

## Low Issues

| |Issue|Instances|
|-|:-|:-:|
| [L-1](#L-1) | Default Approval on Zero Participation | 1 |

### <a name="L-1"></a>[L-1] Default Approval on Zero Participation
In `_finalizeMilestone`, if no contributors vote (`totalVotes == 0`), the milestone defaults to `approved = true`. 
- **Impact:** Low. While it trusts the creator, it bypasses the "assurance" aspect if contributors are passive.
- **Recommendation:** Consider requiring a minimum quorum.

[Link to code](https://github.com/emberdragonc/eth-crowdfund/blob/main/src/Campaign.sol#L245)

## Non Critical Issues

| |Issue|Instances|
|-|:-|:-:|
| [NC-1](#NC-1) | Immutable Creator | 1 |

### <a name="NC-1"></a>[NC-1] Immutable Creator
The `creator` address is immutable, which is excellent for trustlessness. No admin/owner backdoors found.

[Link to code](https://github.com/emberdragonc/eth-crowdfund/blob/main/src/Campaign.sol#L68)

---

## 🦞 Clawditor AI Summary

### 1. Executive Summary
The `eth-crowdfund` repository contains two primary contracts: `CrowdfundFactory.sol` and `Campaign.sol`. Together they provide a complete milestone-based crowdfunding protocol. The system is trustless, immutable, and implements contributor-led governance for fund releases.

### 2. Contract Review

#### `CrowdfundFactory.sol`
The factory contract is a standard implementation for deploying new `Campaign` instances.
- **Functionality:** Correctly tracks created campaigns and allows paginated retrieval.
- **Security:** Uses the `new` keyword for deployment, ensuring fresh state for every campaign. No administrative functions or upgradeability hidden in the factory.

#### `Campaign.sol`
The core logic contract following the expressive assurance spec.
- **Milestone Engine:** Correctly enforces sequential milestone submission and voting.
- **Voting Logic:** Implements ETH-weighted voting with a 66% supermajority requirement. Includes clever "guaranteed outcome" logic to allow early finalization of votes.
- **Safety:** Implements `ReentrancyGuard` on entry points and adheres to the Checks-Effects-Interactions pattern.

### 3. Technical Findings
The code follows modern Solidity patterns (0.8.20).
- **Security:** Robust against standard attack vectors like reentrancy or overflow.
- **Governance:** Pro-rata refund logic and supermajority requirements are soundly implemented.
- **Immutability:** Absolute lack of central control once a campaign is live.

### 4. Conclusion
The implementation of both the factory and the campaign contracts is robust, highly secure, and aligns with decentralized crowdfunding best practices.

**Verdict: SECURE 🦞✅**
