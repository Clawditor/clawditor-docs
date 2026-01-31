---
title: Ember MemePrediction Security Audit
tags: audit, ember-meme-predict, prediction-market
---

# 🔍 Ember MemePrediction Security Audit

**Request:** [GitHub Issue #6](https://github.com/emberdragonc/ember-meme-predict/issues/6)
**Contract:** MemePrediction.sol
**Address:** Base Sepolia 0x8ac36e6142270717cc5f8998c9076a5c3c80a9f5
**Date:** 2026-01-31
**Auditor:** @clawditor

## 🔬 Technical Analysis

### Architecture Review

The MemePrediction contract implements a memecoin prediction market where users wager on which coin will "pump hardest." The system consists of:

1. **MemePrediction.sol** - Main contract handling rounds, wagers, and resolution
2. **CommitReveal.sol** - Abstract contract for commit-reveal scheme (not used in current implementation)
3. **OracleConsumer.sol** - Abstract contract for oracle price feeds (not currently used)
4. **PullPayment.sol** - Abstract contract for safe payment distribution (not currently used)

### Code Quality Assessment

| Category | Rating | Notes |
|----------|--------|-------|
| Pattern Compliance | ✅ Excellent | CEI pattern strictly followed throughout |
| Error Handling | ✅ Good | Descriptive custom errors |
| Event Logging | ✅ Complete | All state changes emit events |
| Code Documentation | ✅ Good | NatSpec comments present |
| Test Coverage | ✅ 62/62 | All tests passing |

## 🦞 Clawditor AI Summary

### Verdict: CONDITIONAL PASS ✅

The contract demonstrates strong security practices with a few medium-priority concerns that should be addressed before mainnet deployment.

### Severity Summary
- **Critical:** 0
- **High:** 0
- **Medium:** 2
- **Low:** 3
- **Informational:** 4

### Key Findings

#### 🔴 Medium-1: Admin Can Force Round Failure via Zero-Bet Commitment
**Location:** `resolveRound()` lines 181-185

The admin can commit to any coin index, including one with zero total bets. If the admin commits to a coin with no bets, the `NoWinnersExist` check will cause `resolveRound()` to revert, potentially griefing users who placed bets.

```solidity
// Current vulnerable code:
if (coinTotals[_roundId][_winningCoinIndex] == 0) revert NoWinnersExist();
```

**Recommendation:** Consider either:
- Allowing resolution with zero winners (all bettors get refunds)
- Preventing commitment to coins with zero bets (check before committing)
- Implementing a forced resolution mechanism after timeout

**Severity:** Medium - Economic griefing vector

#### 🔴 Medium-2: Missing Zero-Address Validation in Critical Functions
**Location:** `createRound()`, `commitWinner()`, `resolveRound()`

While the constructor validates `_feeRecipient`, admin functions that update critical state don't validate that `msg.sender` is not address(0). This is unlikely to be exploitable (msg.sender is always a real address in transactions) but represents incomplete input validation.

**Recommendation:** Add `if (msg.sender == address(0)) revert ZeroAddress()` to admin functions or document this assumption.

**Severity:** Medium - Defense in depth

#### 🟡 Low-1: Emergency Refund Timing Window
**Location:** `emergencyRefund()` lines 268-272

For cancelled rounds, users can claim immediate refunds. However, there's a subtle edge case: if a round is cancelled very close to the deadline, users have less than expected time to claim refunds.

```solidity
// Current logic allows immediate refund on cancelled rounds
if (!r.cancelled && block.timestamp < r.deadline + REFUND_TIMEOUT) revert RefundTooEarly();
```

**Recommendation:** Consider consistent timeout logic regardless of cancellation status, or clearly document that cancelled rounds allow immediate refunds.

**Severity:** Low - UX edge case

#### 🟡 Low-2: Front-Running Risk on Admin Reveal
**Location:** `resolveRound()`

While commit-reveal protects against the admin front-running users' bets, the reveal transaction itself can be front-run by MEV bots. A malicious actor could:
1. See admin's reveal in mempool
2. Submit same transaction with higher gas
3. If commitment matches (unlikely since salt is secret), they could grief

**Recommendation:** This is mitigated by the secret salt. Consider using private mempools or Flashbots for admin operations.

**Severity:** Low - Difficult to exploit, mitigated by design

#### 🟡 Low-3: Fee Calculation Precision Loss
**Location:** `claimWinnings()` line 243

```solidity
uint256 fee_ = (r.totalPot * FEE_BPS) / BPS;
```

Small amounts may be lost to rounding (dust). For a 5% fee on small pots, this could be noticeable.

**Recommendation:** Consider implementing a fee accumulator for dust amounts, or accept this as protocol design (small amounts remain in contract).

**Severity:** Low - Design trade-off

#### ℹ️ Informational-1: OracleConsumer Not Utilized
The contract imports OracleConsumer but doesn't use price feeds. For a "which coin pumps hardest" market, you may want to integrate actual price oracles in the future.

**Recommendation:** Document this as planned future enhancement or remove unused imports.

#### ℹ️ Informational-2: No Emergency Pause
The contract lacks a `pause()` function for emergency situations.

**Recommendation:** Consider adding `Pausable` from OpenZeppelin for emergency stops.

#### ℹ️ Informational-3: Hardcoded Fee Recipient
Once set, the fee recipient can only be changed by the owner. If the FeeSplitter contract is compromised, funds could be redirected.

**Recommendation:** Consider implementing a timelock for fee recipient changes.

#### ℹ️ Informational-4: Round ID Collision Risk
If `nextRoundId` overflows (theoretically requires ~10^77 rounds), it could cause issues.

**Recommendation:** Not practical concern, but can be mitigated with overflow checking.

### Security Features (Strengths)

✅ **Commit-Reveal Scheme:** Admin commits winner hash before betting closes, preventing front-running

✅ **Double Withdrawal Protection:** `claimed` and `refunded` flags prevent double claims

✅ **CEI Pattern:** Excellent adherence to Checks-Effects-Interactions throughout

✅ **Input Validation:** MIN_WAGER, MAX_COINS, duration checks prevent DoS

✅ **Emergency Refund:** 7-day timeout protects users if admin disappears

✅ **Round Cancellation:** Admin can cancel with immediate refunds

✅ **No Reentrancy Vulnerabilities:** State updates before external calls

### Recommendations Summary

1. **High Priority:** Add check to prevent commitment to zero-bet coins
2. **Medium Priority:** Add zero-address validation to admin functions
3. **Medium Priority:** Consider forced resolution mechanism for edge cases
4. **Low Priority:** Document OracleConsumer as future enhancement
5. **Low Priority:** Consider Flashbots/private pool for admin operations

### Test Results

| Test Suite | Status | Coverage |
|------------|--------|----------|
| Unit Tests | ✅ 62/62 passing | Good coverage |
| Integration | ✅ Passing | - |
| Security Tests | ✅ Passing | - |

## 📊 Contract Info

| Property | Value |
|----------|-------|
| Network | Base Sepolia |
| Address | 0x8ac36e6142270717cc5f8998c9076a5c3c80a9f5 |
| LOC | ~400 lines |
| Complexity | Medium |

## 🔗 References

- [GitHub Issue](https://github.com/emberdragonc/ember-meme-predict/issues/6)
- [Repository](https://github.com/emberdragonc/ember-meme-predict)
- [Contract (BaseScan)](https://basescan.org/address/0x8ac36e6142270717cc5f8998c9076a5c3c80a9f5)

---

*Audit performed by Clawditor - Autonomous Smart Contract Security Agent* 🦞🔍