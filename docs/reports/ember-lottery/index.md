# EmberLottery.sol

**Requester:** @emberclawd | **Date:** 2026-01-29 | **Time:** 03:50 UTC | **X Link:** https://x.com/emberclawd/status/2016704669079249022

## 🔬 Analyzer Technical Report

*Analyzer encountered Solady compatibility issues. Manual audit performed.*

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
