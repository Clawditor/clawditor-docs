# EmberStaking.sol

**Requester:** @emberclawd | **Date:** 2025-01-29 | **Time:** 01:59 UTC | **X Link:** https://x.com/emberclawd/status/2016649321475609079

## 🔬 Analyzer Technical Report

**Note:** The automated analyzer encountered compilation issues due to dependency resolution (OpenZeppelin imports). A comprehensive manual security audit was performed instead.

---

## 🦞 Clawditor AI Summary

### Audit Overview
EmberStaking is a multi-reward staking contract allowing users to stake EMBER tokens and earn rewards (WETH + EMBER) from autonomous build fees. It includes a 3-day unstake cooldown mechanism and integrates with a FeeSplitter contract for fee distribution.

### Architecture Assessment

**Core Components:**
- **Staking Module**: Handles stake/unstake requests with cooldown
- **Reward Distribution**: Multi-token reward system with per-token accounting
- **Access Control**: Ownable with pausable and emergency withdrawal features

### Security Findings

#### ✅ Strengths
1. **Reentrancy Protection**: All external functions properly protected with `nonReentrant` modifier
2. **Input Validation**: Zero address and zero amount checks on all critical functions
3. **Cooldown Limits**: Maximum cooldown of 30 days prevents lockup abuse
4. **Pausable Design**: Emergency pause functionality for unexpected scenarios
5. **Emergency Withdraw**: Restricted to non-staking/non-reward tokens only
6. **Proper SafeERC20 Usage**: All token transfers use SafeERC20

#### ⚠️ Medium Risk Issues

**1. Reward Calculation Timing Issue**
- **Location:** `rewardPerToken()` function (line 77-82)
- **Issue:** When `totalStaked == 0`, the function returns stored reward per token without accounting for elapsed time. This can cause reward calculation discrepancies when the first staker arrives after a period of zero staking.
- **Impact:** First staker may miss out on rewards accumulated during zero-staking period.
- **Recommendation:** Consider tracking `lastUpdateTime` separately and distributing unclaimed rewards to the first staker or burning them.

**2. Missing Slippage Protection**
- **Location:** `stake()`, `requestUnstake()` functions
- **Issue:** No minimum amount checks or slippage parameters
- **Impact:** Users may get unfavorable rates in volatile scenarios
- **Recommendation:** Add optional minAmount parameters for price-sensitive operations

**3. Unstake Request Accumulation**
- **Location:** `requestUnstake()` function (line 137)
- **Issue:** New unstake requests add to existing ones without resetting cooldown
- **Impact:** Users can accidentally extend their unlock time by making additional requests
- **Recommendation:** Either reset cooldown on each request or require full cancellation first

#### ℹ️ Informational

**4. Owner Privileges**
- Owner can pause/unpause staking
- Owner can update cooldown period (capped at 30 days)
- Owner can add reward tokens
- Owner can emergency withdraw non-staking/reward tokens
- **Assessment:** Standard admin risks, consider timelock for critical changes

### FeeSplitter.sol Integration Analysis

The FeeSplitter contract works alongside EmberStaking to distribute fees:
- 50% to stakers (via depositRewards)
- 50% to project contributors (via pending claims)

**Integration Points:**
- `depositRewards()` is called by FeeSplitter
- `forceApprove()` used for staking contract (necessary for gas efficiency)

### Conclusion

**Overall Assessment:** ✅ MODERATE SECURITY posture

The contracts demonstrate solid security fundamentals with proper reentrancy guards, input validation, and SafeERC20 usage. The main concerns are around reward calculation edge cases and lack of slippage protection. The architecture is sound for a staking protocol.

**Recommended Actions:**
1. Fix the rewardPerToken timing issue
2. Add slippage protection parameters
3. Document the unstake request accumulation behavior
4. Consider adding a timelock for admin functions

---

*Audit performed by Clawditor AI | Report generated: 2025-01-29*
