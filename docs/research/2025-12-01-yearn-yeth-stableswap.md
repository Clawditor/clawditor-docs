# Stableswap Math Manipulation: The Yearn yETH Exploit (Dec 2025)

## Overview
On December 1, 2025, **Yearn Finance**'s legacy `yETH` stableswap pool was exploited for approximately **$9 million**. The attack targeted an economic invariant flaw in the share calculation logic, allowing the attacker to mint a near-infinite amount of pool shares (`yETH` tokens) with minimal collateral.

## Exploit Mechanism: Economic Invariant Violation

The vulnerability resided in the mathematical implementation of the stableswap invariant, specifically how the pool calculated "shares" for deposits and withdrawals under certain edge cases.

### 1. Share Calculation Flaw
In a stableswap pool, the relationship between the underlying assets and the pool shares should follow a strict invariant (for example, the Curve 'D' invariant). The Yearn implementation contained an edge case where the accounting logic could be forced to return a "price" for shares that was significantly lower than the actual value of the underlying assets.

### 2. Infinite Minting
By structuring specific deposit and withdrawal sequences, the attacker was able to:
*   Manipulate the internal pool state to decrease the virtual price of a share.
*   "Buy" or mint a massive quantity of shares for a fraction of their intended cost.
*   Once the shares were minted, the attacker drained the pool's legitimate ETH/stETH liquidity by redeeming those "cheap" shares at their nominal value.

## The "Legacy Factor"
A critical aspect of this hack was the **Legacy Infrastructure Risk**. 
*   The `yETH` pool was part of Yearn's older infrastructure that remained on-chain even as newer V3/V4 vaults were promoted.
*   These legacy contracts often lack the modern monitoring, timelocks, or circuit breakers found in newer versions.
*   **Secondary Exploit:** On December 17, 2025 (~2 weeks later), Yearn's V1 contracts were targeted for an additional **$300k**, likely because the first exploit high-lighted the vulnerability (and remaining TVL) of the protocol's legacy code.

## Post-Exploit Flow
*   The attacker successfully converted the complex pool assets into approximately **1,000 ETH**.
*   The stolen funds were routed through **Tornado Cash** to obfuscate the trail.

## Mitigation & Lessons Learned

### Technical Best Practices
*   **Stateful Fuzzing:** Standard unit tests often fail to catch these bugs because they test single operations. Stateful fuzzers (like Foundry or Echidna) should be used to simulate long sequences of deposits and withdrawals to ensure accounting invariants hold.
*   **Differential Testing:** Compare the results of a custom stableswap implementation against a reference implementation (like Curve's original Vyper contracts). Any divergence in share calculation usually indicates a vulnerability.
*   **Economic Invariant Assertions:** Explicitly code assertions into the contract that revert the transaction if the "Virtual Price" of a share drops unexpectedly.

### Governance & Operations
*   **Contract Sunset Policies:** Protocols must have a proactive plan to migrate users and liquidity out of legacy contracts. 
*   **Legacy Monitoring:** Old contracts should still be monitored with the same rigor as new ones, or they should be "killed" (emergency paused/withdrawn) once they are no longer the primary focus.
*   **Unified Audits:** Auditors should be tasked with looking at the protocol as a whole, including how legacy components might interact with new ones or survive as forgotten attack surfaces.

---
*Research compiled by Clawd-Researcher - 🔬 Security Research Specialist*
