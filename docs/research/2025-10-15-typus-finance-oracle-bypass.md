# Typus Finance: The Oracle Module Authorization Bypass (October 2025)

On October 15, 2025, Typus Finance, a real-yield options protocol on the Sui blockchain, was exploited for approximately **$3.44 million**. The attack targeted the protocol's liquidity provider pool (TLP) by exploiting a critical flaw in the custom oracle module's price verification logic.

## Technical Overview
Typus Finance utilizes a custom oracle module to determine the settlement prices of options and the underlying value of the TLP pool. In a move common to non-EVM ecosystems (Sui/Move), the protocol implemented its own price-feed logic rather than relying solely on established external oracles.

The vulnerability was rooted in a **missing authorization check** (specifically a missing `assert` statement) within the function responsible for updating and verifying the oracle's output.

## Exploit Mechanism: Price Injection
Instead of manipulating a market (like a typical flash loan oracle attack), the attacker directly subverted the protocol's trust model.

1.  **Bypassing Authorization:** The attacker discovered that the oracle module failed to strictly enforce permission checks on the account providing price data for specific assets (SUI, USDC, xBTC).
2.  **Price Poisoning:** Because of the missing `assert` statement, the attacker was able to inject arbitrary price data into the oracle.
3.  **TLP Drain:** 
    *   The attacker artificially inflated the value of the assets they held within the TLP pool or manipulated the exchange rate to their advantage.
    *   Using the skewed prices, the attacker "arbitraged" the protocol, withdrawing far more value than they had deposited.
    *   The total drained assets included 588k SUI, 1.6M USDC, and significant amounts of xBTC and suiETH.

## Why This Matters (The "Custom Oracle" Hazard)
The Typus Finance incident highlights the recurring danger of **Homegrown Oracles**. While the Move language provides built-in safety features like resource-oriented programming to prevent reentrancy and unauthorized asset burning, it cannot prevent flawed business logic. If the "source of truth" (the oracle) is vulnerable, the entire security of the protocol collapses, regardless of the underlying language safety.

## Mitigation Strategies
*   **Redundant Oracles:** Critical DeFi components should aggregate data from multiple independent oracles (e.g., Pyth, Switchboard, Chainlink) rather than relying on a single custom module.
*   **Permission Enforcement:** Use the Move language's `signer` or `Capability` patterns to strictly enforce that ONLY authorized oracle providers can update price data.
*   **Invariant Sanity Checks:** Implement "circuit breakers" that compare the provided oracle price against a safe price range (percentage change over time) or a fallback oracle.
*   **Formal Verification of Access Control:** Use the Move Prover to formally verify that critical state-changing functions (like price updates) can only be accessed by the intended accounts.

## Conclusion
The Typus Finance hack serves as a primary example of how **logic-level vulnerabilities** remain the dominant threat in modern DeFi. Even in a type-safe environment like Sui/Move, missing a single authorization check in an oracle module can grant an attacker the "root" power to revalue protocol assets at will.
