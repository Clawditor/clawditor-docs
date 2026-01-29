# Lodestar Finance: The GLPOracle Donation Manipulation Exploit (December 2022)

On December 10, 2022, **Lodestar Finance**, a lending protocol on the Arbitrum network, suffered a critical oracle manipulation exploit resulting in the theft of approximately **$6.5 million** in user deposits. The attack exploited a fundamental flaw in how the protocol's internal price oracle (`GLPOracle`) calculated the exchange rate of the plvGLP token, specifically failing to account for the impact of a donation mechanism that could arbitrarily inflate the protocol's internal accounting of assets.

## Technical Overview
Lodestar Finance operated as a collateralized lending platform that accepted **plvGLP** (PlutusDAO's wrapper for GMX's GLP token) as collateral. The protocol's solvency depended on the accurate pricing of plvGLP through its `GLPOracle` contract. 

The vulnerability was rooted in the **donation mechanism** of the underlying GlpDepositor contract, which allowed any user to arbitrarily increase the contract's `totalAssets` balance without depositing a corresponding amount of collateral.

## Exploit Mechanism: The 1.688x Price Inflation
The attacker exploited the disconnect between the **actual market value** of GLP and the **internally calculated value** reported by the GLPOracle.

1.  **Flash Loan Accumulation:** The attacker acquired a significant amount of capital using a flash loan, which would later be used to manipulate market conditions and maximize leverage.
2.  **Donation Inflation:** The attacker called the `donate()` function on the **GlpDepositor** contract. This function allowed anyone to transfer tokens directly to the contract and increase its `totalAssets` balance.
    *   Critically, the `GLPOracle` calculated the price of plvGLP based on `totalAssets / totalSupply`.
    *   By donating a large amount of sGLP (staked GLP) to the GlpDepositor contract, the attacker artificially increased the `totalAssets` numerator without increasing the `totalSupply` denominator.
3.  **Oracle Poisoning:** The GLPOracle's price feed reflected the manipulated `totalAssets` value. According to post-mortem analysis, the attacker was able to push the price of plvGLP up by 1.688 times (a nearly 70 percent increase) through this mechanism alone.
4.  **Over-Leveraged Borrowing:** With the plvGLP price artificially inflated in Lodestar's eyes, the attacker could borrow significantly more against their collateral than the underlying assets were worth. They deposited their plvGLP collateral and took out massive loans in other assets (USDC, ETH, etc.).
5.  **Exit and Conversion:** After draining the lending pools, the attacker converted the borrowed assets to sGLP, repaid the flash loan, and exited with the stolen funds.

## Why This Matters (The Accounting Oracle Anti-Pattern)
The Lodestar exploit highlights a critical failure mode in **Accounting Oracles**—price feeds that derive value from internal protocol state rather than external market data.

*   **The Donation Vector:** The ability for a user to arbitrarily "donate" assets to a contract that uses those assets as a price denominator is a fundamental architectural flaw. It creates a "self-referential" price that can be gamed by any holder of the underlying token.
*   **Single-Block Manipulation:** Unlike external oracle manipulation (which may require sustained price pressure), the donation attack could be executed instantaneously within a single transaction, bypassing any time-weighted averaging safeguards that might have existed.
*   **The "Infinite Money" Glitch:** In essence, the attacker found a way to manufacture "free equity" out of thin air by simply transferring tokens they already controlled into a specific contract address.

## Mitigation Strategies
*   **Donation Sanctions:** Protocols should strictly control or eliminate donation mechanisms that affect critical financial state. If donations are required for incentives, they should be tracked separately from core asset accounting.
*   **External Price Verification:** Never rely solely on internal accounting for collateral pricing. Cross-verify the calculated price against an external, manipulation-resistant oracle (for example, Chainlink or Pyth). If the internal price deviates from the external price by more than a threshold (for example, 5 percent), the transaction should revert.
*   **TWAP on Internal State:** If internal accounting must be used, implement a Time-Weighted Average Price (TWAP) mechanism that smooths changes to `totalAssets` over a time window (for example, 1 hour), preventing single-transaction manipulation.
*   **Invariant Checks:** Implement checks that ensure the `totalAssets` value cannot increase faster than a realistic deposition rate, or that the resulting price cannot deviate beyond a realistic market range.

## Conclusion
The $6.5M Lodestar Finance exploit is a textbook example of **Internal Oracle Failure**. By exploiting the donation mechanism of a supporting contract, the attacker turned the protocol's own accounting against it. This case serves as a warning that **"price" is only as trustworthy as the accounting mechanics that define it**. Protocols must rigorously test their internal state transitions against adversarial donation and inflation attacks.
