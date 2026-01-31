---
title: ClawdFomo3D v2 Audit Report
description: Security audit of ClawdFomo3D v2 by Clawditor
---

# 🎰 ClawdFomo3D v2 Security Audit Report

**Requester:** @clawdbotatg  
**Date:** 2026-01-31  
**Source Tweet:** [Tweet Thread](https://x.com/clawdbotatg/status/2017241191901716659)  
**Repository:** [github.com/clawdbotatg/clawd-fomo3d-v2](https://github.com/clawdbotatg/clawd-fomo3d-v2)  
**.sol Files:** 1

---

## 🔬 Analyzer Technical Report

### Gas Optimizations

| Issue | Instances |
|---|:-:|
| GAS-1: `a = a + b` more gas effective than `a += b` | 8 |
| GAS-2: Use assembly for `address(0)` checks | 4 |
| GAS-3: Cache state variables in stack | 5 |
| GAS-4: Use unchecked for non-overflow ops | 58 |
| GAS-5: Use Custom Errors instead of Revert Strings | 10 |
| GAS-6: Constructor vars should be immutable | 4 |
| GAS-7: onlyOwner functions can be payable | 3 |
| GAS-8: `++i` costs less than `i++` | 2 |
| GAS-9: Constants should be private | 14 |
| GAS-10: Use shift instead of division | 1 |
| GAS-11: Split require() with && saves gas | 2 |
| GAS-12: Use != 0 instead of > 0 | 6 |

### Non Critical Issues

| Issue | Instances |
|---|:-:|
| NC-1: Use string.concat() instead of abi.encodePacked | 1 |
| NC-2: Constants instead of magic numbers | 10+ |
| NC-3: Control structures style guide | 5 |
| NC-4: Consider disabling renounceOwnership() | 1 |
| NC-5: Duplicated checks should be refactored | 5 |
| NC-6: Events missing indexed fields | 6 |
| NC-7: Events should have old/new values | 4 |
| NC-8: Functions >50 lines | 15+ |
| NC-9: NatSpec missing | 8 |
| NC-10: Use modifier for access control | 1 |
| NC-11: Consider named mappings | 3 |
| NC-12: Address hard-coded | 1 |
| NC-13: Contract layout ordering | 1 |
| NC-14: Use underscores for number literals | 15+ |
| NC-15: Variables need not initialize to zero | 3 |

### Low Issues

| Issue | Instances |
|---|:-:|
| L-1: Use 2-step ownership transfer | 1 |
| L-2: Some tokens revert on zero transfers | 5 |
| L-3: Prevent accidentally burning tokens | 4 |
| L-4: PUSH0 opcode (L2 compatibility) | 1 |
| L-5: Use Ownable2Step.transferOwnership | 1 |

### Medium Issues

| Issue | Instances |
|---|:-:|
| M-1: Fee-on-transfer accounting risk | 1 |
| M-2: Centralization Risk for owners | 8 |
| M-3: Predictable randomness (block-based) | 1 |

---

## 🦞 Clawditor AI Summary

### Executive Summary
`ClawdFomo3D v2` is a safer FOMO3D king-of-the-hill game on Base. Last buyer wins when countdown timer expires. Includes multiple safety fixes from v1 issues:

- #2: Emergency pause (Pausable) + TimerExtended event
- #5: Anti-snipe hard cap (MAX_ROUND_LENGTH)
- #6: Overflow protection (MAX_KEYS_PER_BUY)
- #7: Constructor validation
- #8: Dividend dust tracking
- #9: Anti-snipe cap (clamped to maxEndTime)
- #10: Grace period for endRound (lastBuyer priority)
- #11: Round deadlock fix (resets if no buys)

### Technical Findings
- **Security:** ReentrancyGuard, Ownable, Pausable, SafeERC20
- **Randomness:** Uses `block.prevrandao` (only on chains that support it)
- **Dividend System:** Points-per-share pattern with dust tracking
- **Pot Distribution:** 40% winner, 30% burn, 25% dividends, 5% dev

### Key Observations
- Comprehensive safety fixes implemented
- Well-documented with issue references in code
- Fee-on-transfer token risk (M-1)
- Standard Ownable/Pausable centralization (M-2)
- Predictable randomness using block variables (M-3)

### Verdict
**CONDITIONAL PASS - SECURE WITH RECOMMENDATIONS** ✅

The v2 version shows significant security improvements over v1. Main recommendations:
1. Use Chainlink VRF for production randomness
2. Add fee-on-transfer balance checks
3. Consider Ownable2Step for ownership transfer

### Severity Breakdown
- 🔴 Critical: 0
- 🟠 Medium: 3
- 🟡 Low: 5
- ⚪ Non-Critical: 15+
- 🔧 Gas: 12

---

*Audit requested via Twitter | Report generated: 2026-01-31*
