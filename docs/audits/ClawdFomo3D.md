# ClawdFomo3D.sol

### Audit Metadata
- **Requested By:** @camdenInCrypto
- **Date:** 2026-01-27
- **Time:** 23:55 GMT
- **Source:** [X Request Tweet](https://x.com/camdenInCrypto/status/2016298166518255856)
- **Repository:** [clawdbotatg/clawdfomo3d](https://github.com/clawdbotatg/clawdfomo3d)

---

## 1. Executive Summary
`ClawdFomo3D.sol` is a king-of-the-hill style game contract utilizing the $CLAWD token. It features a decaying timer, a dynamic key pricing model, and a dividend distribution system for key holders. The contract incorporates deflationary mechanisms via token burning on purchases and at the conclusion of each round.

## 2. Technical Analysis

### 2.1 Game Mechanics
- **Timer:** Starts at `timerDuration`. Buying keys resets or extends the timer.
- **Anti-Snipe:** If a buy occurs within `ANTI_SNIPE_THRESHOLD` (2 mins), the timer is set to `ANTI_SNIPE_EXTENSION` (2 mins) rather than a full reset. This effectively prevents "last-second" sniping by forcing a minimum window for counter-moves.
- **Pricing:** Uses an arithmetic sequence for key costs: `BASE_PRICE + (totalKeys * PRICE_INCREMENT)`.

### 2.2 Tokenomics & Yield
- **Burn:** 10% of every purchase is burned. 30% of the final pot is burned.
- **Dividends:** 25% of the pot is allocated to key holders based on their share of `totalKeys`.
- **Winner:** 40% of the pot goes to the `lastBuyer`.

## 3. Vulnerability Assessment

### 3.1 Round Reset Logic (Medium Risk)
In `endRound()`, the state is reset for the next round:
```solidity
currentRound++;
roundStart = block.timestamp;
roundEnd = block.timestamp + timerDuration;
totalKeys = 0;
lastBuyer = address(0);
pointsPerKey = 0;
```
**Issue:** `pointsPerKey` is reset to 0. While `roundPointsPerKey[currentRound] = pointsPerKey;` captures the snapshot, `claimDividends` relies on `_dividendsOf`, which calculates:
```solidity
uint256 ppk = round < currentRound ? roundPointsPerKey[round] : pointsPerKey;
```
If a user forgets to claim dividends before a subsequent round ends, the snapshot `roundPointsPerKey[round]` persists correctly. However, the `pointsCorrection` and `keys` are round-specific in the `players` mapping:
```solidity
mapping(uint256 => mapping(address => Player)) public players;
```
This multi-dimensional mapping correctly isolates player state by round, mitigating cross-round dividend drainage.

### 3.2 Integer Overflow/Underflow (Low Risk)
The contract uses Solidity 0.8.20, which has built-in overflow/underflow checks. The manual point correction logic:
```solidity
p.pointsCorrection -= int256(pointsPerKey * numKeys);
```
uses `int256` correctly to allow negative offsets (Standard "Points Per Share" pattern).

### 3.3 Reentrancy (Low Risk)
The contract uses `nonReentrant` on all state-changing functions (`buyKeys`, `endRound`, `claimDividends`) and adheres to the Checks-Effects-Interactions pattern by updating `withdrawnDividends` before the transfer in `claimDividends`.

## 4. Recommendations
1. **Pot Initialization:** Consider seeding the pot for Round 1 or subsequent rounds to maintain initial engagement.
2. **Gas Optimization:** In `getCostForKeys`, the arithmetic sequence sum formula is efficient, but ensure `numKeys` is bounded to prevent potential OOG on extremely large purchases (though unlikely given the pricing curve).

## 5. Conclusion
`ClawdFomo3D.sol` is a well-structured implementation of the Fomo3D mechanic with modern security practices. The use of round-indexed mappings for player state and the `nonReentrant` guard provides robust protection against common game-theory and technical exploits.

**Status: SECURE 🦞**
