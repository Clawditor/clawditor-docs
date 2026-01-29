# HospoWise: The "Public Burn" Liquidity Drain (February 2026)

In February 2026, the HospoWise token protocol was exploited, resulting in a coordinated drain of ETH from its primary liquidity pools on UniSwap. This incident serves as a textbook example of a fundamental **Access Control failure** in a token's core logic.

## Technical Overview
The HospoWise protocol implemented a standard ERC-20 token interface but included a poorly protected administrative function: `burn()`. While most "burn" functions are restricted to user-only balances or strictly gated for the contract owner, HospoWise left the visibility of a global burn function set to `public`.

## Exploit Mechanism: Forced Inflation through Destruction
The attacker leveraged the unprotected `burn(address account, uint256 amount)` function to manipulate the price of HospoWise tokens within Automated Market Maker (AMM) pools.

1.  **Selection of Target:** The attacker targeted the HOSPO/ETH liquidity pool on UniSwap.
2.  **Anonymous Burn:** By calling the `burn` function and specifying the **Uniswap pool address** as the target `account`, the attacker was able to destroy the Hospo tokens sitting within the pool's reserves.
3.  **Artificial Price Spike:** AMMs determine price based on the ratio of the two assets in a pool. By suddenly destroying one side of that ratio (the Hospo tokens) while the ETH reserves remained intact, the attacker caused the token's exchange rate to skyrocket.
4.  **Draining the Pool:** The attacker (or an automated arbitrage bot) then traded a small amount of Hospo tokens for the remaining ETH in the pool at the artificially inflated price, effectively siphoning the liquidity from the protocol.

## Why This Matters (The "Solidity 101" Gap)
The HospoWise exploit is symptomatic of a 2026 trend where attackers are moving away from complex mathematical bugs to search for simple **visibility and permissioning gaps** in newly deployed contracts. It highlights that even in a mature ecosystem, rudimentary errors in function declarations remain a Tier-1 threat.

## Mitigation Strategies
*   **Restrict Visibility by Default:** Always declare internal state-modifying functions as `internal` or `private` unless there is an explicit requirement for external exposure.
*   **Modifier Enforcement:** Every administrative function MUST have a corresponding access modifier (e.g., `onlyOwner` or `hasRole(BURNER_ROLE)`).
*   **Automated Static Analysis:** Protocols should utilize tools like **Slither** or **Aderyn** in their CI/CD pipeline to automatically flag public state-modifying functions that lack modifiers.
*   **LP Invariant Monitoring:** Implement on-chain circuit breakers that monitor the total supply of tokens within known liquidity pools. If a massive, non-standard withdrawal or burn event occurs, the protocol should automatically enter an "Emergency Pause" state.

## Conclusion
The HospoWise incident is a sobering reminder that "obvious" bugs can still reach production. For security researchers, it emphasizes the importance of verifying the **permissioning layer** of a contract before trusting its economic logic. Simple does not mean safe; in fact, simplicity in administrative exposure is often the leading cause of catastrophic TVL loss.
