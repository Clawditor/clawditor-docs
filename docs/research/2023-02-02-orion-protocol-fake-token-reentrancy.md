# Orion Protocol: The "Fake Token" Reentrancy Exploit (February 2023)

On February 2, 2023, the Orion Protocol was exploited on both Ethereum and BNB Chain for approximately **$3 million**. This attack is a classic example of **cross-function reentrancy** combined with **untrusted contract calls**, showing how a protocol's internal accounting can be deceived by a malicious ERC-20 implementation.

## Technical Overview
The vulnerability resided in the `ExchangeWithOrionPool` contract, specifically within the `swapThroughOrionPool` function. The protocol lacked a reentrancy guard (`nonReentrant` modifier) in a critical swap path that interacted with untrusted user-provided tokens.

## Exploit Mechanism: The "ATK" Fake Token
The attacker didn't just re-enter a single function; they used a malicious contract to manipulate the protocol's state during a swap.

1.  **Flash Loan Initial Capital:** The attacker used a flash loan to provide the initial liquidity (USDC/USDT) required for the attack.
2.  **Malformed Token Injection:** The attacker provided a custom, malicious ERC-20 token (let's call it "ATK") as one of the assets in the swap path.
3.  **The Malicious Callback:** During the swap, the Orion contract called the `transferFrom` or `transfer` function of the malicious ATK token.
4.  **Re-entry into `depositAsset`:** Instead of simply returning `true`, the ATK token's code called *back* into the Orion contract's `depositAsset` function.
5.  **Accounting Deception:**
    *   The `depositAsset` function updated the attacker's balance for a legitimate asset (e.g., USDT).
    *   Because the original `swapThroughOrionPool` was still executing, the protocol's internal accounting logic was "confused" by the sudden mid-execution state change.
    *   The final calculation of the swap results used the newly "deposited" (but fake) balance, allowing the attacker to credit themselves with more assets than they actually provided.

## Why This Matters (The "Untrusted Input" Rule)
The Orion exploit serves as a stark reminder of the most basic rule in smart contract security: **Never trust an external call to an unknown address.** If your contract interacts with an ERC-20 token provided by the user, you must assume that token's code is malicious. Without reentrancy guards and the **Checks-Effects-Interactions (CEI)** pattern, any external call is a potential portal for an attacker to rewrite your contract's state.

## Mitigation Strategies
*   **Universal Reentrancy Guards:** Use `nonReentrant` on *every* public/external function that modifies state or performs external calls.
*   **Token Whitelisting:** For protocols that handle liquidity, only allow interactions with known, audited token contracts.
*   **Checks-Effects-Interactions (CEI):** Ensure all internal state updates occur *before* any external call is made. By the time the code reaches the `transfer` call, the transaction's outcome should already be accounted for.
*   **Balance Snapshots:** Compare `balanceOf(address(this))` before and after external calls to verify that the expected amount of the expected asset was actually transferred, rather than relying solely on the return value or mid-transaction state.

## Conclusion
The Orion Protocol hack demonstrated that reentrancy is not a "solved problem." As protocols grow in complexity, the surface area for state-disruption increases. Secure development requires a "zero-trust" approach to external contract interactions and a rigid adherence to state-management patterns.
