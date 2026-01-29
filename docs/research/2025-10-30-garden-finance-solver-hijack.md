# Garden Finance: The Solver-Network Trust Exploit (October 2025)

On October 30, 2025, Garden Finance, a cross-chain liquidity protocol, was exploited for approximately **$11 million**. This incident represents a significant shift in DeFi vulnerability trends: rather than a flaw in the smart contract bytecode, the attack targeted the **Solver Network**—the off-chain agents responsible for fulfilling user "intents" across different trust boundaries.

## Technical Overview
Garden Finance utilizes an **Intent-Based Architecture**. In this model, users do not specify the exact steps of a trade (for example, "call Uniswap, then bridge"). Instead, they sign an "intent" (for example, "swap 100 ETH on Arbitrum for 100 ETH worth of BTC on Bitcoin"). "Solvers" (off-chain actors) compete to fulfill these intents, providing the requested liquidity in exchange for a fee.

The vulnerability was an **operational compromise of a centralized solver** which the protocol’s smart contracts trust implicitly to validate state transitions.

## Exploit Mechanism: The Solver Hijack
The attacker did not find a bug in the liquidity pool math. Instead, they targeted the **authentication layer** of one of the protocol’s primary solvers.

1.  **Solver Compromise:** The attacker gained unauthorized access to the private keys or API infrastructure of a single, highly-active solver in the Garden network.
2.  **False Fulfillment Proofs:** Using the compromised solver, the attacker submitted "fulfillment proofs" to the protocol’s cross-chain settlement contracts. These proofs claimed that the solver had successfully delivered assets to users on destination chains (for example, Bitcoin) when, in reality, no such transfers had occurred.
3.  **Liquidity Siphoning:** The settlement contracts, trusting the cryptographic signature of the authorized solver, released the user-provided collateral on the source chains (Ethereum, Arbitrum, BSC) to the "fulfiller"—effectively the attacker.
4.  **Multi-Chain Drain:** Because solvers are often permissioned to handle large batches of intents, the attacker was able to drain liquidity across multiple networks simultaneously before the protocol's guardians could revoke the solver's authorization.

## Why This Matters (The "Intent" Security Gap)
The Garden Finance heist highlights the **Off-Chain Trust Assumption** in modern DeFi.
*   **Infrastructure Risk:** As protocols move off-chain to reduce gas costs and improve user experience (via intent-based models), they introduce a dependence on off-chain server security.
*   **Centralization of Authority:** Many intent-based protocols launch with a "Whitelisted Solver" model. If a single whitelisted actor is compromised, the protocol’s on-chain invariants are bypassed by the authorized "witness" of that actor.

## Mitigation Strategies
- **Multi-Solver Verification (Quorums):** Do not rely on a single solver's proof. Significant cross-chain movements should require validation from multiple independent solvers or a decentralized validator set.
- **Optimistic Settlement with Challenges:** Utilize an optimistic bridging model where intents are settled but "locked" for a challenge period. Independent watchers can then verify against destination chain data and trigger a revert if the intent was never fulfilled.
- **Hardware-Isolated Solvers:** Mandate that all whitelisted solver keys be managed within Secure Enclaves (TEEs) or Hardware Security Modules (HSMs) to prevent simple server-side key theft.
- **On-Chain Path Validation:** Integrate zero-knowledge proofs (ZKP) or state relays that allow the source-chain contract to verify that the destination-chain event actually happened without human or solver-intermediated trust.

## Conclusion
The $11M Garden Finance incident is a warning for the "Next Gen" of DeFi. While solvers provide UX efficiency, they also serve as a high-value bridge between trustless code and trusted infrastructure. In 2026 and beyond, security researchers must scrutinize not just the smart contract logic, but the **integrity of the agent-networks** that drive them.
