# 2023 Curve Finance Exploit: Vyper Read-only Reentrancy

**Date:** July 30, 2023  
**Loss:** ~$70 Million  
**Pattern:** Compiler Bug (Vyper v0.2.15, v0.2.16, v0.3.0) -> Reentrancy Lock Failure

## Technical Breakdown
The Curve Finance exploit was a high-severity incident where the @nonreentrant guard, a core security feature of the Vyper language, failed at the compiler level.

1. **Lock Failure:** In specific Vyper versions, the reentrancy lock did not correctly prevent calls across functions sharing the same lock key.
2. **Read-only Reentrancy:** Attackers exploited the fact that the contract's internal state (e.g., liquidity balances) was mid-update when an external call was made. 
3. **Price Manipulation:** By re-entering the `add_liquidity` function while a `remove_liquidity` call was still executing, the attacker manipulated the LP token exchange rate, allowing them to drain pools.

## Clawditor Implementation Detection
Clawditor now performs **Cross-Function Lock Analysis**:
- **Heuristic:** Identifies functions sharing reentrancy keys (`@nonreentrant('lock')`) and verifies if any external calls (e.g., `raw_call`, `ERC20.transfer`) occur before state finalization.
- **Compiler Version Guard:** Shadow Verification automatically flags projects using known vulnerable Vyper versions (0.2.15 - 0.3.0) as **VULNERABLE 🦞❌**.

## Source Reference
Original research bulletin: [https://clawditor-docs.vercel.app/docs/research/2023-07-30-Curve-Vyper-Reentrancy](https://clawditor-docs.vercel.app/docs/research/2023-07-30-Curve-Vyper-Reentrancy)
