# Aevo (Ribbon): The Legacy Vault Oracle Upgrade Exploit (December 2025)

On December 14, 2025, the legacy Ribbon DeFi Options Vaults (DOV), managed by Aevo, were exploited for approximately **$2.7 million**. This incident serves as a critical warning on the dangers of **upgrading stateful oracles** within complex, legacy systems and the catastrophic impact of **decimal mismatches**.

## Technical Overview
Ribbon Finance rebranded to Aevo in 2023, transitioning from structured products to a derivatives exchange. However, several Ribbon DOV vaults remained active on the Ethereum mainnet. To maintain these vaults, the team performed a recent upgrade to the oracle "pricer" logic six days prior to the exploit.

The vulnerability was introduced during this upgrade, specifically in how the protocol handled varying decimal precision from different oracle feeds.

## Exploit Mechanism: Decimal Precision Mismatch
The attacker leveraged a logic error where the protocol's internal accounting assumed a consistent decimal scale that no longer matched the upgraded oracle outputs.

1.  **Imbalanced Upgrade:** The upgrade updated the price feeds for assets like `stETH`, `PAXG`, `LINK`, and `AAVE` to 18-decimal outputs. However, the price feed for `USDC` (the primary quote/collateral asset) was maintained at its native **8 decimals**.
2.  **Logic Assumption:** The vault's settlement and liquidation logic assumed all price data was normalized to a specific scale (likely 18 decimals).
3.  **The Price Glitch:** When the vault attempted to calculate the value of collateral vs. debt, the 8-decimal `USDC` price was interpreted as being ten orders of magnitude (10^10) smaller than intended.
4.  **Instant Arbitrage/Drain:** By depositing a small amount of an 18-decimal asset and borrowing/withdrawing against it, the attacker could effectively "buy" the protocol's USDC at an extremely undervalued rate or force liquidations based on incorrect collateral valuations.
5.  **Execution:** The attacker systematically drained the remaining liquidity from these legacy vaults before the team could halt the contracts.

## Why This Matters (The "Stale Code" Liability)
The Aevo incident highlights the **ongoing liability of legacy infrastructure**. Even when a project moves on to a new product (Aevo exchange), the old contracts (Ribbon vaults) sitting on-chain with liquidity remain active surfaces. Security audits for the "new" product often overlook the maintenance scripts and upgrades applied to "old" but vital components.

## Mitigation Strategies
- **Normalization Invariants:** Never assume the decimal precision of an oracle. Always use a decorator or wrapper that explicitly normalizes all outputs to a fixed internal precision (e.g., `WAD` 18 decimals) before performing calculations.
- **Upgrade Regression Testing:** Upgrades to core components like oracles must be tested against the state of *every* dependent contract, including legacy ones. Using a mainnet fork to simulate the upgrade and subsequent user actions is essential.
- **Semantic Monitoring:** Implement monitoring that flags "extreme price sudden shifts" or "internal valuation mismatches." If the total value of assets in a vault changes by a significant percentage immediately following an administrative upgrade, the protocol should enter an automated failsafe.
- **Sunset Strategy:** Projects should have a proactive plan to fully sunset and migrate users off legacy infrastructure once a transition is complete, rather than maintaining multiple logic versions on-chain indefinitely.

## Conclusion
The $2.7M Aevo exploit proves that mathematical security is not just about the code, but about the **continuity of configuration**. A single decimal discrepancy in a routine maintenance upgrade can be just as damaging as a zero-day logic bug. For researchers, this emphasizes the need to look at the **interfaces** where different versions of code and data meet.
