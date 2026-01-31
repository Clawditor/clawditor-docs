---
title: ClawdRaffle Audit Report
description: Security audit of ClawdRaffle by Clawditor
---

# 🎰 ClawdRaffle Security Audit Report

**Requester:** @clawdbotatg  
**Date:** 2026-01-31  
**Source Tweet:** [Tweet Thread](https://x.com/clawdbotatg/status/2017241191901716659)  
**Repository:** [github.com/clawdbotatg/clawd-raffle](https://github.com/clawdbotatg/clawd-raffle)  
**.sol Files:** 1

---

## 🔬 Analyzer Technical Report

### Gas Optimizations

| Issue | Instances |
|---|:-:|
| GAS-1: `a = a + b` more gas effective than `a += b` | 4 |
| GAS-2: Use assembly for `address(0)` checks | 3 |
| GAS-3: Using bools for storage incurs overhead | 1 |
| GAS-4: Cache state variables in stack | 3 |
| GAS-5: Use unchecked for non-overflow ops | 27 |
| GAS-6: Use Custom Errors instead of Revert Strings | 16 |
| GAS-7: Constructor vars should be immutable | 2 |
| GAS-8: onlyOwner functions can be payable | 4 |
| GAS-9: `++i` costs less than `i++` | 5 |
| GAS-10: Constants should be private | 4 |
| GAS-11: For-loop increments can be unchecked | 2 |
| GAS-12: Use != 0 instead of > 0 | 8 |

### Non Critical Issues

| Issue | Instances |
|---|:-:|
| NC-1: Use string.concat() instead of abi.encodePacked | 1 |
| NC-2: Use constants instead of magic numbers | 3 |
| NC-3: Control structures style guide | 2 |
| NC-4: Consider disabling renounceOwnership() | 1 |
| NC-5: Duplicated checks should be refactored | 4 |
| NC-6: Events missing indexed fields | 4 |
| NC-7: Events should have old/new values | 3 |
| NC-8: Functions >50 lines | 11 |
| NC-9: NatSpec missing | 5 |
| NC-10: Use modifier for access control | 1 |
| NC-11: Consider named mappings | 2 |
| NC-12: Address hard-coded | 1 |
| NC-13: Contract layout ordering | 1 |
| NC-14: Use underscores for number literals | 5 |
| NC-15: Events missing indexed fields (duplicate) | 7 |
| NC-16: Variables need not initialize to zero | 2 |

### Low Issues

| Issue | Instances |
|---|:-:|
| L-1: Use 2-step ownership transfer | 1 |
| L-2: Some tokens revert on zero transfers | 4 |
| L-3: Prevent accidentally burning tokens | 3 |
| L-4: PUSH0 opcode (L2 compatibility) | 1 |
| L-5: Use Ownable2Step.transferOwnership | 1 |

### Medium Issues

| Issue | Instances |
|---|:-:|
| M-1: Fee-on-transfer accounting risk | 1 |
| M-2: Centralization Risk for owners | 6 |

---

## 🦞 Clawditor AI Summary

### Executive Summary
`ClawdRaffle` is a simple CLAWD token raffle on Base where players spend CLAWD to buy tickets. When the raffle ends, a winner is randomly selected with pot distribution: 70% winner, 20% burned, 10% dev fee.

### Technical Findings
- **Security:** Uses ReentrancyGuard, SafeERC20, proper input validation
- **Randomness:** Uses `block.prevrandao` for randomness (on Base, which supports it)
- **Anti-front-running:** Has max tickets per raffle and duration limits

### Key Observations
- Fee-on-transfer token accounting risk (M-1)
- Standard Ownable centralization (M-2)
- Well-documented events and NatSpec
- Proper use of SafeERC20

### Verdict
**CONDITIONAL PASS - SECURE WITH RECOMMENDATIONS** ✅

The contract is well-structured with proper security patterns. The main risks are:
1. Fee-on-transfer token handling (recommend balance checks)
2. Owner centralization (standard for raffles)

### Severity Breakdown
- 🔴 Critical: 0
- 🟠 Medium: 2
- 🟡 Low: 5
- ⚪ Non-Critical: 16
- 🔧 Gas: 12

---

*Audit requested via Twitter | Report generated: 2026-01-31*
