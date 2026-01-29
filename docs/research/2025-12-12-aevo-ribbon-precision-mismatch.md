# Aevo/Ribbon Finance: The "Zombie Code" Oracle Exploit (December 2025)

On December 12, 2025, Aevo (formerly Ribbon Finance) suffered a **$2.7 million** exploit of its legacy Ribbon DeFi Options Vaults (DOV). This incident is a textbook example of the "upgrade-legacy interface" failure, where modernizing one component introduced a catastrophic mismatch in a forgotten, older module.

## Technical Overview
Ribbon Finance transitioned to Aevo in 2023, refocusing on an options/perpetuals exchange. However, legacy DOV vaults remained active on-chain. The vulnerability was triggered by a recent upgrade to the protocol’s **Oracle Pricer** system, intended to standardize pricing across active and legacy products.

The core issue was a **decimal precision mismatch** between updated 18-decimal feeds and existing 8-decimal assets within the legacy accounting logic.

## Exploit Mechanism: The 10^10 Precision Glitch
The attack leveraged a vulnerability introduced during the standardization of oracle outputs.

1.  **Imbalanced Upgrade:** The oracle upgrade updated the feeds for highly-liquid assets (stETH, LINK, AAVE) to output 18 decimals of precision. Crucially, the feed for **USDC**—the primary quote and settlement asset for many vaults—remained at its native **8 decimals**.
2.  **Legacy Accounting:** The legacy Ribbon vault logic was not updated to handle dynamic decimal normalization. It assumed a fixed scale across all price inputs.
3.  **The Valuation Gap:** When the vaults performed "health checks" or calculated settlement values, the logic interpreted the 8-decimal USDC price as if it were 18 decimals. This made USDC appear **10 billion times ($10^{10}$)** less valuable than its actual price.
4.  **The Drain:** Attackers noticed the mismatch and executed a series of trades and withdrawals. By utilizing the skewed math, they were able to "buy" options or withdraw collateral at prices that valued the vault's assets at fractions of a wei.
5.  **Access Control Secondary Flaw:** Post-mortem analysis by Halborn also revealed a secondary access control vulnerability in the proxy-based oracle stack that allowed the attacker to set expiry prices for newly-created assets, accelerating the drainage.

## Why This Matters (The "Zombie Code" Threat)
The Aevo exploit highlights that **maintenance is an attack vector**. Many protocols focus security resources on active products while neglecting the security implications of applying "standard" upgrades to legacy codebases. As protocols mature, this "zombie code"—legacy infrastructure that functions quietly until disturbed—becomes a prime target.

## Mitigation Strategies
- **Explicit Normalization:** Never assume input precision. Use internal decorators like `normalizeTo18Decimals()` for all external data sources.
- **Integration Regression Testing:** Upgrades to shared infrastructure (like Oracles) must undergo regression testing against the state of **all** dependent contracts, not just the latest versions.
- **Invariant Sanity Checks:** Implement "Sanity Guard" invariants that verify the total protocol value before and after an administrative upgrade. If the calculated TVL swings by a nonsensical amount (for example, +/- 99%), the upgrade should automatically revert.
- **Complete Feature Flags:** When deprecating code, use administrative "circuit breakers" to disable all non-essential functionality while users migrate, rather than leaving the logic in a "warm" but unmonitored state.

## Conclusion
The $2.7M Aevo incident serves as a sobering reminder that DeFi security is not just about the quality of the current code, but the **continuity of the state machine**. A single decimal discrepancy during a routine maintenance task can effectively reset the protocol's economic reality to zero.
