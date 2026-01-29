# HospoWise: The Public Burn Access Control Failure (February 2026)

In February 2026, the HospoWise token protocol was exploited, leading to a significant drainage of ETH from its primary liquidity pools on UniSwap. This incident serves as a textbook example of a fundamental **Access Control failure**, where a sensitive supply-management function was unintendedly left public.

## Technical Overview
The HospoWise protocol implemented a standard ERC-20 token contract with an added `burn` function intended for administrative use or user-initiated token destruction. However, the function was declared with `public` visibility but lacked any permission-restricting modifiers (such as `onlyOwner` or a dedicated `BURNER_ROLE`).

## Exploit Mechanism: Forced Liquidity Imbalance
The attacker leveraged the unprotected `burn` function to manipulate the price of HospoWise tokens within its logic-linked Automated Market Maker (AMM) pools.

1.  **Selection of Target:** The attacker targeted the HOSPO/ETH liquidity pool on UniSwap.
2.  **Anonymous Burn:** By calling the `burn` function and specifying the UniSwap pool address as the target, the attacker was able to destroy the HospoWise tokens sitting *inside* the pool's reserves.
3.  **Artificial Price Inflation:** AMMs utilize the Constant Product Formula ($x \times y = k$). By suddenly and drastically reducing the token reserve ($x$) via the `burn` call, the relative value of the remaining tokens in the pool skyrocketed.
4.  **The Drain:** The attacker (or an arbitrage bot) then swapped a small amount of HospoWise tokens—acquired prior to the burn or held separately—for the pool's remaining ETH reserves at the artificially inflated price.

## Why This Matters (The "Security 101" Gap)
The HospoWise incident is part of a 2026 shift where attackers are moving away from complex mathematical bugs to search for simple **visibility and permissioning gaps** in newly deployed contracts. It highlights that even in a mature ecosystem, rudimentary errors in function declarations remain a Tier-1 threat.

## Mitigation Strategies
*   **Restrict Visibility by Default:** Always declare functions as `internal` or `private` unless they are explicitly required for external interaction. 
*   **Standardized Access Control:** Utilize established libraries like OpenZeppelin's `Ownable` or `AccessControl`. Every state-modifying function, especially those impacting supply (mint/burn), must be protected by a modifier.
*   **Automated Static Analysis:** Protocols should integrate tools like **Slither** or **Aderyn** into their CI/CD pipelines to automatically flag public functions that modify sensitive state without modifiers.
*   **Supply Invariants:** Implement "Sanity Guard" checks that revert transactions if the total supply of a token changes by more than a set percentage (for example, 5%) within a single block without a corresponding governance event.

## Conclusion
The HospoWise heist is a sobering reminder that **"Simple" does not mean "Safe."** A single missing line of code—a modifier—can invalidate the entire economic model of a protocol. Security researchers must prioritize the verification of administrative interfaces, as they often represent the softest targets in the modern DeFi stack.
