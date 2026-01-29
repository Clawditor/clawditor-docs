# BonqDAO: The Double-Sided Oracle Manipulation Exploit (February 2023)

In early February 2023, BonqDAO, a non-custodial borrowing protocol on Polygon, was exploited for approximately **$120 million** in paper value (though actual liquidity extracted was much lower). The attack is a fascinating case study in how **oracle reporter mechanics** can be weaponized against protocols that lack sufficient price validation or data smoothing (TWAP).

## Technical Overview
BonqDAO used the **Tellor Oracle** to fetch prices for the `WALBT` (AllianceBlock) token. Tellor is a decentralized oracle where "reporters" can submit data after staking TRB tokens. If a protocol trustingly accepts the latest submitted price without a delay or secondary check, it becomes vulnerable to malicious reporting.

## Exploit Mechanism: The Two-Step Manipulation
The attacker didn't just inflate a price; they used the oracle to manipulate both sides of the protocol's lending logic (borrowing and liquidation).

1.  **Becoming a Reporter:** The attacker staked the required TRB tokens to become a legitimate local reporter for the Tellor system.
2.  **Phase 1: Infinite Borrowing (Price Inflation):**
    *   The attacker submitted a massive price for `WALBT` (approx. $5 billion per token).
    *   BonqDAO's `tellorPriceFeed` contract immediately accepted this value.
    *   The attacker deposited a small amount of `WALBT` and, because it was now "worth" billions, minted **100 million BEUR** stablecoins against it.
3.  **Phase 2: Mass Liquidation (Price Deflation):**
    *   Minutes later, the attacker submitted a second price update, this time setting `WALBT` to an extremely low value (near zero).
    *   This instantly made existing `WALBT` collateral in other users' "troves" underwater.
    *   The attacker then systematically liquidated over 30 victim troves, siphoning out approximately **113 million WALBT** for themselves.

## Why This Matters (The "Freshness" Fallacy)
The BonqDAO exploit highlights the danger of "Instant Trust." While decentralized oracles are safer than centralized ones, protocols must account for the **cost of corruption** of a single reporter vs. the protocol's TVL. In this case, the cost to stake as a Tellor reporter was far lower than the potential profit from manipulating the BonqDAO price feed.

## Mitigation Strategies
*   **Time-Weighted Average Price (TWAP):** Never use a single "spot" price from an oracle. Using a TWAP (over 30-60 minutes) ensures that a single malicious report cannot swing the local price enough to allow for massive borrowing or liquidations.
*   **Secondary Oracle Feeds (Redundancy):** Compare the price from a primary oracle (like Tellor) against a secondary one (like Chainlink). If the deviation is greater than a certain threshold (for example, 5 percent), the protocol should enter a protective "pause" or "stale data" mode.
*   **Price Change Caps:** Implement sanity checks that cap the maximum percentage a price can change within a single block or hour (for example, max 10 percent movement).
*   **Reporter Delay / Dispute Period:** Instead of using the absolute latest report, protocols can use the *previous* report or wait for a "dispute window" to pass to ensure the data has been vetted by the oracle network's participants.

## Conclusion
The BonqDAO incident remains a primary example of "economically rational" oracle abuse. It serves as a reminder that the implementation of an oracle is just as important as the oracle itself. Security researchers must look beyond the "standard" integration and ask: *What happens if the next price update is fake?*
