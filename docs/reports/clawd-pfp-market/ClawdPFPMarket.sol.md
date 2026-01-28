# ClawdPFPMarket.sol

### Audit Metadata
- **Requested By:** @camdenInCrypto
- **Date:** 2026-01-28
- **Time:** 06:05 GMT
- **Source:** [X Request Tweet](https://x.com/camdenInCrypto/status/2016389595672252650)
- **Repository:** [clawdbotatg/clawd-pfp-market](https://github.com/clawdbotatg/clawd-pfp-market)

---

## 🔬 Analyzer Technical Report

## Gas Optimizations

| |Issue|Instances|
|-|:-|:-:|
| [GAS-1](#GAS-1) | `a = a + b` is more gas effective than `a += b` for state variables | 2 |
| [GAS-2](#GAS-2) | For operations that will not overflow, you could use `unchecked` | 12 |
| [GAS-3](#GAS-3) | Use Custom Errors instead of Revert Strings to save gas | 15 |
| [GAS-4](#GAS-4) | State variables only set in the constructor should be declared `immutable` | 1 |
| [GAS-5](#GAS-5) | `++i` costs less gas compared to `i++` | 2 |
| [GAS-6](#GAS-6) | Use `!= 0` instead of `> 0` for unsigned integer comparison | 5 |

### <a name="GAS-1"></a>[GAS-1] `a = a + b` is more gas effective than `a += b` for state variables
*Instances (2)*:
```solidity
148:         totalPool += STAKE_AMOUNT;
176:         totalPool += STAKE_AMOUNT;
```

### <a name="GAS-2"></a>[GAS-2] For operations that will not overflow, you could use `unchecked`
*Instances (12)*:
```solidity
145:         uint256 id = submissionCount++;
202:         claimedCount++;
209:         stakerPoolRemaining -= payout;
303:         uint256 burnAmount = (pool * BURN_BPS) / 10000;
304:         uint256 opBonus = (pool * OP_BONUS_BPS) / 10000;
305:         uint256 _stakerPool = pool - burnAmount - opBonus;
```

### <a name="GAS-3"></a>[GAS-3] Use Custom Errors instead of Revert Strings to save gas
*Instances (15)*:
```solidity
138:         require(!hasSubmitted[msg.sender], "Already submitted");
139:         require(bytes(imageUrl).length > 0, "Empty URL");
166:         require(id < submissionCount, "Invalid submission");
168:         require(sub.status == Status.Whitelisted, "Not whitelisted");
193:         require(winnerPicked, "No winner yet");
```

## Low Issues

| |Issue|Instances|
|-|:-|:-:|
| [L-1](#L-1) | Prevent accidentally burning tokens (Zero address checks) | 1 |
| [L-2](#L-2) | Centralization Risk: Admin powers | 4 |
| [L-3](#L-3) | Solidity version 0.8.20+ may not work on all L2s due to `PUSH0` | 1 |

### <a name="L-1"></a>[L-1] Prevent accidentally burning tokens
The `transferAdmin` function should check that the `newAdmin` is not the zero address (partially addressed by existing check).

### <a name="L-2"></a>[L-2] Centralization Risk: Admin powers
The admin has the power to whitelist, ban, and most crucially, pick the winner which determines the distribution of 100% of the staked tokens.

---

## 🦞 Clawditor AI Summary

### 1. Executive Summary
`ClawdPFPMarket.sol` is a prediction market contract for profile picture selection. It uses a bonding curve to determine share distribution and provides a secure "pull" mechanism for reward claims. The design includes essential safeguards like `ReentrancyGuard` and an emergency rescue mechanism.

### 2. Technical Findings
- **Bonding Curve:** The implementation correctly normalizes shares to whole units before price calculation, avoiding common scaling bugs.
- **Security Check:** Logic is protected against reentrancy and uses `SafeERC20` for all token interactions.
- **Accounting:** The claim pattern is gas-efficient and robust against dust accumulation by awarding the remainder to the final claimer.

### 3. Key Observations
- **Performance:** `getTopSubmissions` uses an $O(n^2)$ sorting algorithm. While suitable for the intended scale, it is a point of theoretical limitation.
- **Transparency:** The admin's role in "picking" the winner is a central trust point.

### 4. Conclusion
Status: **SECURE 🦞**
The contract follows high-assurance patterns. Recommendations for gas optimization (Custom Errors, `unchecked` blocks) have been identified.
