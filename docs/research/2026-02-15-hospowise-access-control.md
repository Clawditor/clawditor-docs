# HospoWise: The "Public Burn" Logic Defect (February 2026)

In February 2026, the HospoWise token protocol was exploited, leading to a massive drainage of native assets and underlying liquidity. The incident serves as a textbook example of a fundamental **Access Control failure** in a token's core supply logic.

## Technical Overview
The HospoWise protocol implemented a standard ERC-20 interface but included a poorly gated administrative function: `burn()`. While most "burn" functions are either internal (allowing users to only burn their own balances) or strictly restricted to the contract owner, HospoWise left the visibility of a global burn function set to `public`.

## Exploit Mechanism: Forced Liquidity Imbalance
The attacker identified that the `burn(address account, uint256 amount)` function lacked any permission modifiers (like `onlyOwner`). This allowed any external caller to destroy tokens belonging to *any* address.

1.  **Supply Destruction:** The attacker targeted the protocol's primary liquidity pools on UniSwap.
2.  **Anonymous Burn:** By calling the `burn` function and specifying the UniSwap pool address as the target, the attacker was able to destroy the Hospo tokens sitting within the pool's reserves.
3.  **Artificial Inflation:** In an AMM (Automated Market Maker), the price of a token is determined by the ratio of the two assets in the pool. By suddenly destroying one side of that ratio (the Hospo tokens) while keeping the ETH/USDC side constant, the attacker caused the token's "fair market value" within the pool to skyrocket.
4.  **The Drain:** The attacker (or a front-running bot) then traded a small amount of Hospo tokens for the pool's remaining ETH reserves at the artificially inflated price, effectively siphoning the value out of the pool.

## Why This Matters (The "Solidity 101" Gap)
The HospoWise exploit is part of a 2026 trend where attackers are moving away from complex mathematical bugs to search for simple **visibility and permission gaps** in newly deployed contracts. It highlights that even in a mature ecosystem, rudimentary errors in function declarations remain a Tier-1 threat.

## Mitigation Strategies
*   **Explicit Visibility:** Always default to `internal` or `private` for functions that modify state. Only elevate to `public`/`external` when absolutely necessary for user interaction.
*   **Modifier Enforcement:** Every administrative function must have a corresponding access modifier (for example, `onlyOwner` or `hasRole(BURNER_ROLE)`).
*   **Static Analysis Integration:** Basic static analysis tools like Slither would have flagged a public state-modifying function with no modifiers. Protocols must integrate these tools into their deployment pipelines.
*   **Supply Invariants:** Implement circuit breakers that monitor total supply changes. If a massive percentage of the supply is burned within a single block without a corresponding administrative event, the protocol should automatically enter an "Emergency Pause" state.

## Conclusion
The HospoWise incident is a sobering reminder that "obvious" bugs can still reach production and result in millions in losses. For security researchers, it emphasizes the importance of verifying the **permissioning layer** of a contract before trusting its economic logic.
