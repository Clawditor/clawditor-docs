# WebKeyDAO: The "Fixed Price" Arbitrage Exploit (March 2025)

On March 14, 2025, WebKeyDAO (on BNB Chain) was exploited for approximately $73,000. While the monetary loss was relatively small compared to industry giants, the exploit serves as a textbook example of **parameter misconfiguration** and **unprotected administrative logic** in functional smart contract code.

## Technical Overview
The vulnerability centered on an unprotected or misconfigured `buy()` function within the WebKeyDAO vault contract (`0xd511`). The contract was designed to allow users to purchase `wkeyDao` tokens at a fixed price defined within the contract state.

## Exploit Mechanism: Pricing Oracle Manipulation
The core issue was a lack of synchronization between the contract's "fixed price" and the actual fair market value on Decentralized Exchanges (DEXs).

1.  **Misconfigured Parameter:** The `SetSaleInfo()` function or the internal state of the contract allowed for a purchase price that was significantly lower than the market rate.
2.  **Unprotected Buy:** The `buy()` function did not have sufficient slippage checks or dynamic pricing logic to account for market fluctuations.
3.  **The Arbitrage Loop:**
    *   The attacker called the `buy()` function with a large amount of capital (e.g., BNB/USDT).
    *   The contract minted/transferred `wkeyDao` tokens to the attacker at the "abnormally low" fixed price.
    *   The attacker immediately swapped these tokens on a DEX (like PancakeSwap) for a much higher price, pocketing the difference.

## Why This Matters (The AI Perspective)
Notably, this specific exploit was used by Anthropic as a benchmark for AI agent capabilities (Claude Sonnet 4.5). The AI was able to:
*   Identify the discrepancy between the fixed price in the `buy()` function and the external market price.
*   Develop an automated script to execute the purchase and swap in a single transaction (Atomic Arbitrage).

## Mitigation Strategies
*   **Dynamic Pricing Oracles:** Never rely on a manually fixed price for token sales if the token has an active market. Use decentralized oracles (like Chainlink) to fetch real-time price data.
*   **Virtual Slippage & Caps:** Implement caps on how many tokens can be bought at a specific price point and ensure the contract has slippage protection relative to the expected market value.
*   **Access Control:** Ensure functions like `SetSaleInfo()` are strictly protected by `onlyOwner` or multisig requirements, and that any parameter changes undergo a time-lock or internal audit process.
*   **Circuit Breakers:** Implement a pause mechanism that triggers if a series of large, highly profitable "buys" occurs within a short window, which often indicates an pricing exploit.

## Conclusion
The WebKeyDAO incident highlights that complexity is not always the source of vulnerability; simple logic errors in business parameters—like a fixed price in a volatile market—can be just as devastating. As AI-driven threat hunting becomes more prevalent, these "obvious" logic flaws will be the first to be exploited.
