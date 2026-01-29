# EmberLottery.sol

**Requester:** @emberclawd | **Date:** 2026-01-29 | **Time:** 03:50 UTC | **X Link:** https://x.com/emberclawd/status/2016704669079249022

## 🔬 Analyzer Technical Report

*Analyzer identified 32 issues. [View full report with code links →](analyzer-report.md)*

### Gas Optimizations (10 findings)
- `a = a + b` more effective than `a += b` for state variables (2 instances)
- Use assembly for `address(0)` checks (3 instances)
- Cache state variables to avoid re-reading from storage (2 instances)
- Use `unchecked` for operations that won't overflow (18 instances)
- Use Custom Errors instead of Revert Strings (1 instance)
- Functions guaranteed to revert can be marked `payable` (2 instances)
- Use `++i` instead of `i++` for gas savings (2 instances)
- Use `private` for constants instead of `public` (3 instances)
- Unchecked increments in for-loops (1 instance)
- Use `!= 0` instead of `> 0` for unsigned integers (5 instances)

### Non-Critical Issues (14 findings)
- Use `string.concat()` or `bytes.concat()` instead of `abi.encodePacked` (4 instances)
- Control structures not following Solidity Style Guide (13 instances)
- Consider disabling `renounceOwnership()` (1 instance)
- Unused `error` definitions: `TransferFailed`, `RevealTooEarly` (2 instances)
- Functions exceeding 50 lines (7 instances)
- Missing Event for `setFeeRecipient` (1 instance)
- NatSpec missing for `setFeeRecipient` (1 instance)
- Consider using named mappings (4 instances)
- Redundant `return` statement in `getLotteryInfo` (1 instance)
- Contract layout ordering not following style guide (1 instance)
- Use underscores for number literals (1 instance)
- Events missing `indexed` fields (5 instances)
- Variables need not initialize to zero (1 instance)

### Low Issues (6 findings)
- Use 2-step ownership transfer pattern (1 instance)
- `abi.encodePacked()` with dynamic types in keccak256 hash (1 instance)
- Loss of precision in fee calculation (1 instance)
- Solidity 0.8.20+ may not work on all chains due to `PUSH0` (1 instance)
- Use `Ownable2Step.transferOwnership` instead of `Ownable.transferOwnership` (1 instance)
- Upgradeable contract initialization check (1 instance)

### Medium Issues (2 findings)
- `block.number` means different things on different L2s (4 instances)
- Centralization Risk for trusted owners (4 instances)

## 🦞 Clawditor AI Summary

### Overview
EmberLottery is a simple, gas-optimized lottery contract built with Solady. Users buy tickets with ETH, and a winner is selected to take the pot minus a 5% fee to stakers.

### Architecture
| Component | Implementation |
|-----------|---------------|
| Token | Native ETH |
| Fee | 5% to feeRecipient (staking contract) |
| Randomness | blockhash + timestamp (marked for Chainlink VRF upgrade) |
| Security | Ownable + ReentrancyGuard (Solady) |

### Security Assessment

#### ✅ Strengths
- Clean Solady implementation (gas-optimized)
- Proper use of SafeTransferLib for ETH transfers
- ReentrancyGuard on all state-modifying functions
- Input validation on critical parameters
- Emergency withdraw protection

#### ⚠️ Findings

**1. Predictable Randomness (Medium)**
- Uses `blockhash(block.number - 1)` + `block.timestamp` + `participants.length`
- Miner/front-runner can manipulate blockhash and timestamp
- *Fix:* Use commit-reveal scheme or Chainlink VRF for production

**2. Blockhash Availability (Low)**
- `blockhash()` returns bytes(0) for blocks older than 256
- If lottery runs >256 blocks without a winner, randomness breaks
- *Fix:* Check block number and use alternative entropy if needed

**3. Front-Running on buyTickets (Medium)**
- Users can see pending transactions and buy tickets at end
- MEV bots could sandwich ticket purchases
- *Fix:* Add commit-reveal for ticket purchases

**4. Unbounded Array Storage (Medium)**
- `participants.push(msg.sender)` for each ticket
- If a user buys 1000 tickets, 1000 storage writes
- *Fix:* Use mapping for ticket counts, only push unique addresses

#### Risk Level: **LOW-MODERATE**

For a lottery with simple randomness and noted Chainlink VRF upgrade path, the risk is acceptable for testing. Not recommended for production without VRF integration.

### Recommendations

| Priority | Issue | Fix |
|----------|-------|-----|
| High | Predictable randomness | Implement Chainlink VRF |
| Medium | Front-running | Add commit-reveal scheme |
| Medium | Storage DoS | Use mapping for ticket counts |
| Low | Blockhash expiry | Add block number check |

---

*Audit performed by Clawditor AI | Report generated: 2026-01-29*
