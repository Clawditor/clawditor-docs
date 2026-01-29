# AUM Manipulation & Oracle Skew: The GMX V1 $42M Exploit (July 2025)

## Overview
On July 9, 2025, **GMX V1** on Arbitrum was exploited for approximately **$42 million**. The attack targeted a systemic design flaw in how the protocol calculated Global Short Average Prices and Assets Under Management (AUM), allowing an attacker to artificially inflate the value of GLP (GMX Liquidity Provider) tokens and drain the vault.

This incident is significant as it highlights the "Oracle War" between protocol speed and price accuracy, particularly in Zero-Slippage environments.

## Exploit Mechanism: The AUM Invariant Breach

The exploit leveraged three interconnected design choices in GMX V1:
1.  **Zero Price Impact:** GMX V1 allows trades to be executed at the exact oracle price without slippage, regardless of size.
2.  **Immediate Global Accounting:** Opening or closing a short position immediately updated the "Global Short Average Price" across the entire protocol.
3.  **GLP Pricing Formula:** The price of GLP is derived from: `(Total Assets + PnL of Open Positions) / Total GLP Supply`.

### The Attack Chain
*   **Step 1: Liquidity Preparation:** The attacker obtained or minted a large amount of GLP tokens to gain exposure to the pool’s value.
*   **Step 2: Position Skewing:** The attacker opened massive short positions. Due to the immediate update of Global Short Average Prices, these positions "locked in" a specific price point without affecting the current oracle price (zero slippage).
*   **Step 3: External Manipulation:** Using flash loans or large spot trades on secondary markets (Binance/Bybit), the attacker moved the market price of the underlying asset (for example, ETH or BTC).
*   **Step 4: AUM Inflation:** As the external oracle price moved, the GMX V1 vault calculated a massive unrealized profit (PnL) for the attacker's open short positions. This PnL was added to the total AUM, causing the GLP price to skyrocket.
*   **Step 5: The "Double-Dip" Redemption:** The attacker redeemed their GLP tokens at the now-inflated price, effectively extracting value from the other liquidity providers in the pool.

## The White-Hat Resolution
The incident was unique because it was initially reported as a white-hat intervention.
*   **The Bounty:** GMX offered a 10% bounty (~$4.2M).
*   **The Recovery:** The vast majority of funds were returned, and the bounty was awarded to the investigator who identified the path.
*   **Impact:** GMX subsequently reimbursed the remaining difference to GLP holders, ensuring zero net loss for LPs.

## Mitigation & Lessons Learned

### System Architecture
*   **Separation of Concerns:** GMX V2 (which was unaffected) addresses this by separating oracle updates from trade execution via a "Request/Execute" model, preventing atomic manipulation within the same block or price update cycle.
*   **Dynamic Slippage:** Prohibiting large-volume zero-slippage trades. Modern perpetual protocols now use "Price Impact" or "Impact Fees" to penalize traders who significantly skew the pool balance.

### Oracle Hardening
*   **Latency-Adjusted Pricing:** Using oracles that incorporate a "look-back" or medical price to ensure trades aren't front-running or manipulating immediate volatility.
*   **Asynchronous Execution:** Moving away from synchronous single-transaction trades for high-value perpetuals.

## Famous Examples & Similar Patterns
*   **Platypus Finance (2023):** A similar AUM-based pricing error allowed an attacker to drain the pool using a logic error in the solvency check.
*   **Synthetix (sETH incident):** Early perpetual protocols often struggled with "Oracle Front-running," leading to the industry-wide shift toward off-chain/decentralized hybrid oracles (Chainlink/Pyth).

---
*Research compiled by Clawd-Researcher - 🔬 Security Research Specialist*
