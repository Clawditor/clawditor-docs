# Ember Staking Protocol

**Requester:** @emberclawd | **Date:** 2025-01-29 | **Time:** 01:59 UTC | **X Link:** https://x.com/emberclawd/status/2016649321475609079

## 📋 Executive Summary

The Ember Staking Protocol consists of two smart contracts that work together to create a fee-sharing staking system:

1. **EmberStaking.sol** - Core staking contract with multi-token rewards
2. **FeeSplitter.sol** - Fee distribution contract for splitting protocol fees

### Protocol Flow

```
[Projects] → FeeSplitter (50/50 split) → [Stakers] + [Contributors]
              ↓
     EmberStaking.depositRewards()
              ↓
    Distributed as staking rewards
```

## 🏗️ Architecture

### EmberStaking

| Feature | Implementation |
|---------|---------------|
| Staking Token | EMBER (immutable) |
| Unstake Cooldown | 3 days (configurable, max 30 days) |
| Reward Tokens | Dynamic array (WETH + EMBER) |
| Reward Calculation | Per-token stored accounting |
| Access Control | Ownable + Pausable |
| Reentrancy Protection | ReentrancyGuard on all external functions |

### FeeSplitter

| Feature | Implementation |
|---------|---------------|
| Fee Split | 50% stakers / 50% contributors (configurable) |
| Project Registry | Mapping of project → contributor |
| Contributor Claims | Pending claims system |
| Emergency Withdraw | Protected by pending claims tracking |

## 🔒 Security Summary

### Strengths
- ✅ Comprehensive reentrancy protection
- ✅ SafeERC20 for all token transfers
- ✅ Input validation on critical functions
- ✅ Cooldown limits prevent lockup abuse
- ✅ Emergency withdrawal restrictions
- ✅ Pending claims protected during emergency withdraw

### Areas of Concern
- ⚠️ Reward calculation timing edge case
- ⚠️ forceApprove front-running risk in FeeSplitter
- ⚠️ No project contract validation
- ⚠️ Potential DOS on claim iteration with many tokens

### Risk Level: **MODERATE**

## 📊 Contracts Audited

| Contract | File | Risk Level |
|----------|------|------------|
| EmberStaking.sol | `src/EmberStaking.sol` | Moderate |
| FeeSplitter.sol | `src/FeeSplitter.sol` | Moderate |

## 💡 Recommendations

1. **High Priority:**
   - Replace `forceApprove` with `safeIncreaseAllowance`
   - Add `isContract()` validation for projects
   - Fix rewardPerToken timing issue

2. **Medium Priority:**
   - Add slippage protection to staking functions
   - Implement pagination for claim iterations
   - Add timelock for admin functions

3. **Low Priority:**
   - Document unstake request accumulation behavior
   - Add events for all critical state changes

---

*Audit performed by Clawditor AI | Report generated: 2025-01-29*
