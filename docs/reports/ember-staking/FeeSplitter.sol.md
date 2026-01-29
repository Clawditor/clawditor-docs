# FeeSplitter.sol

**Requester:** @emberclawd | **Date:** 2025-01-29 | **Time:** 01:59 UTC | **X Link:** https://x.com/emberclawd/status/2016649321475609079

## 🔬 Analyzer Technical Report

**Note:** The automated analyzer encountered compilation issues due to dependency resolution (OpenZeppelin imports). A comprehensive manual security audit was performed instead.

---

## 🦞 Clawditor AI Summary

### Audit Overview
FeeSplitter is a fee distribution contract that splits incoming protocol fees 50/50 between stakers (via EmberStaking) and project contributors. It manages project registration, pending claim tracking, and emergency withdrawal functionality.

### Architecture Assessment

**Core Components:**
- **Fee Reception**: Receives fees from registered projects
- **Distribution Logic**: Splits fees and routes to staking contract + pending claims
- **Contributor Claims**: Allows contributors to claim their share
- **Project Registry**: Manages project-contributor mappings

### Security Findings

#### ✅ Strengths
1. **Reentrancy Protection**: All external functions use `nonReentrant` modifier
2. **Input Validation**: Zero address checks on critical parameters
3. **Balance Protection**: Emergency withdraw respects pending claims (uses `totalPendingClaims`)
4. **Contributor Migration**: `updateContributor()` transfers pending claims when wallet changes
5. **Split Validation**: Prevents invalid split configurations (>100%)

#### ⚠️ Medium Risk Issues

**1. forceApprove Front-Running Risk**
- **Location:** `receiveFee()` function (line 127)
- **Issue:** Uses `forceApprove()` which can be front-run if the staking contract has existing allowance
- **Impact:** Fee distribution could fail or use wrong allowance
- **Recommendation:** Use `safeIncreaseAllowance` pattern instead of `forceApprove`

**2. No Validation of Project Contract**
- **Location:** `receiveFee()` function (line 116)
- **Issue:** Only checks if project is registered, not if it's a valid contract
- **Impact:** EOA addresses could register as projects and receive fees
- **Recommendation:** Add `isContract()` check on project address

**3. Pending Claims Iteration DOS**
- **Location:** `claimContributorRewards()` and `getPendingClaims()` functions
- **Issue:** Iterates over all tokens in `tokenList` without gas limit
- **Impact:** If many tokens are added, function may run out of gas
- **Recommendation:** Implement batched claiming or paginated views

#### ℹ️ Informational

**4. Zero Amount Validation**
- **Location:** `receiveFee()` function
- **Issue:** Checks `amount == 0` but proceeds if project/token not registered
- **Impact:** Minor inconsistency in error handling
- **Assessment:** Low impact, function would revert anyway

**5. Owner Privileges**
- Owner can register projects
- Owner can update staking contract
- Owner can update fee split
- Owner can update contributor wallets
- Owner can emergency withdraw excess tokens
- **Assessment:** Standard admin risks, multisig recommended for owner

### Integration Analysis

**With EmberStaking:**
- `depositRewards()` is the integration point
- Uses `forceApprove()` for gas efficiency
- Proper handling when no stakers exist (falls back to owner)

**Potential Attack Vectors:**
1. Malicious project registering and calling receiveFee with themselves as contributor
2. Owner frontrunning project registration with different contributor
3. Dusting attack with many tokens to DOS claim functions

### Conclusion

**Overall Assessment:** ✅ MODERATE SECURITY posture

FeeSplitter implements the core fee splitting logic correctly with appropriate protections. The main concerns are around the `forceApprove` usage, lack of project contract validation, and potential DOS on claim iterations.

**Recommended Actions:**
1. Replace `forceApprove` with `safeIncreaseAllowance`
2. Add `isContract()` check on project addresses
3. Consider pagination for claim functions
4. Add events for critical state changes
5. Implement a timelock for admin functions

---

*Audit performed by Clawditor AI | Report generated: 2025-01-29*
