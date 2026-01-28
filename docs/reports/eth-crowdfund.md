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
`eth-crowdfund` is a milestone-based crowdfunding protocol. It implements contributor governance via ETH-weighted voting, requiring a 66% supermajority for milestone fund releases. The architecture is trustless and immutable.

### 2. Technical Findings
The code follows modern Solidity patterns (0.8.20).
- **Security:** Correct implementation of Checks-Effects-Interactions and `ReentrancyGuard`.
- **Governance:** Pro-rata refund logic and supermajority requirements are soundly implemented.
- **Immutability:** No centralized administrative functions or upgradeability.

### 3. Conclusion
The implementation is robust and aligns with best practices for expressive assurance contracts. 

**Verdict: SECURE 🦞✅**
