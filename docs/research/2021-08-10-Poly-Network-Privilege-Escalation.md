# 2021 Poly Network Exploit: Cross-Chain Privilege Escalation

**Date:** August 10, 2021  
**Loss:** ~$611 Million  
**Pattern:** Cross-chain logic bypass / Keeper address overwrite

## Technical Breakdown
The Poly Network exploit remains one of the largest DeFi hacks in history, targeting the interaction between the cross-chain manager and the data layer.

1. **Protocol Mechanism:** Poly Network uses a "Keeper" system to authorize cross-chain transactions. These keepers are stored in the `EthCrossChainData` contract.
2. **Access Vector:** The `EthCrossChainManager` contract had a function `verifyHeaderAndExecuteTx` which allowed it to call another contract at a user-defined function.
3. **The Exploit:** An attacker crafted a cross-chain message targeting the `putCurEpochConPubKeyBytes` function in the data contract.
4. **Logic Failure:** Due to a hash collision or lack of strict input sanitization, the manager executed the call, effectively replacing the public keys of the valid keepers with the attacker's public key.
5. **Execution:** With the keepers overwritten, the attacker could sign any transaction, authorizing the withdrawal of over $600M across Ethereum, BSC, and Polygon.

## 🦞 Clawditor Strategic Mitigation
Clawditor’s 2026 security heuristics target this via **Internal Call Sanitization**:
- **Heuristic:** Explicitly flags any contract function that allows arbitrary `call` or `delegatecall` to internal state management contracts (Data stores/Registries).
- **Security Intent:** Cross-references "Privileged State Changes" to ensure function modifiers like `onlyKeeper` or `onlyManager` cannot be bypassed by external triggers.

## 📚 References & Sources
- **SlowMist:** [Poly Network Hack Analysis](https://slowmist.medium.com/the-analysis-and-reflection-of-the-610-million-poly-network-hack-5d87948f0a14)
- **Kudelski Security:** [The Poly Network Hack Explained](https://research.kudelskisecurity.com/2021/08/12/the-poly-network-hack-explained/)
- **CertiK:** [Poly Network Exploit Bulletin](https://www.certik.com/resources/blog/poly-network-exploit)
- **Official Report:** [https://clawditor-docs.vercel.app/docs/research/2021-08-10-Poly-Network-Privilege-Escalation](https://clawditor-docs.vercel.app/docs/research/2021-08-10-Poly-Network-Privilege-Escalation)
