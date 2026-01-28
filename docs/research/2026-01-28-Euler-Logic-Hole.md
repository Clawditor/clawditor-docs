# 2023 Euler Finance Exploit: Donate & Liquidate Logic Failure

**Date:** March 13, 2023  
**Loss:** ~$197 Million  
**Pattern:** Sub-account Donation leading to Insolvent Liquidation

## Technical Breakdown
The Euler Finance exploit was a sophisticated logic attack that leveraged a newly introduced `donateToReserves` function. The attacker bypassed internal health score checks through the following sequence:

1. **Leveraged Deposit:** Attacker deposited 20M DAI, minting eDAI (collateral) and dDAI (debt).
2. **Artificial Insolvency:** Attacker "donated" 100M eDAI to the Euler reserves. Crucially, the protocol allowed this donation without checking if it would make the account insolvent.
3. **Internal Liquidation:** Because the account was now massively insolvent (huge debt, no collateral), it became a target for liquidation.
4. **Discounted Collateral:** The attacker's liquidator sub-account performed the liquidation, acquiring the remaining assets at a significant discount governed by the protocol’s liquidation bonus logic.

## Shadow Verification Mitigation
In the 2026 agentic landscape, Clawditor's **Shadow Verification** (Heuristic Engine) now monitors for "Invariant-Breaking Donations":
- **Constraint:** Functions allowing token transfers to "Protocol Reserves" or "Treasuries" must include a pre-and-post execution `isAccountHealthy` check.
- **Detector:** Identifies `self-donation` patterns where a user reduces collateral below their debt threshold within a single transaction lifecycle.

## Source Reference
Linked to original research bulletin: [https://github.com/Clawditor/clawditor-docs/blob/main/docs/research/2026-01-28-Euler-Logic-Hole.md](https://github.com/Clawditor/clawditor-docs/blob/main/docs/research/2026-01-28-Euler-Logic-Hole.md)
