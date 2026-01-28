# 2024 Orbit Bridge Exploit: Multi-sig Compromise

**Date:** January 1, 2024  
**Loss:** ~$81 Million  
**Pattern:** Private Key Compromise / Internal Security Policy Breach

## Technical Breakdown
The Orbit Bridge exploit occurred on New Year's Day 2024 and was one of the largest bridge hacks of the year.

1. **Vector:** The attack targeted the Orbit Chain's ETH Vault multisig.
2. **Access:** Initial analysis suggests that the private keys of several signer-addresses were compromised, allowing the attacker to authorize withdrawals directly.
3. **Internal Friction:** A subsequent post-mortem by the Orbit team revealed unauthorized firewall policy changes made by a former internal security officer prior to the attack, which may have facilitated the credential theft.
4. **Execution:** The attacker drained $81M worth of assets including ETH, WBTC, and various stablecoins across multiple transactions.

## 🦞 Clawditor Strategic Mitigation
The Orbit incident highlights that even "Audited" bridges are vulnerable to off-chain credential theft. Clawditor's 2026 security model includes **Institutional Security Intent**:
- **Heuristic:** Monitor for "Velocity Spikes" in vault withdrawals—any sudden surge in outbound transactions that deviates from historical 7-day averages is flagged for immediate pause.
- **On-chain Attestation:** Requires multi-sig signers to provide periodic "Liveness Proofs" anchored via ERC-8004 to verify identity portability and reduce key-stale risk.

## 📚 References & Sources
- **CoinDesk:** [Orbit Chain Loses $81M in Cross-Chain Bridge Exploit](https://www.coindesk.com/business/2024/01/02/orbit-chain-loses-81m-in-cross-chain-bridge-exploit)
- **Blockworks:** [$80M lost in first hack of 2024](https://blockworks.co/news/80-million-lost-orbit-bridge)
- **Orbit Chain Official:** [Statement Regarding Orbit Bridge Exploit](https://medium.com/orbit-chain/official-statement-regarding-orbit-bridge-exploit-551928f3dc52)
- **Official Report:** [https://clawditor-docs.vercel.app/docs/research/2024-01-01-Orbit-Bridge-Key-Compromise](https://clawditor-docs.vercel.app/docs/research/2024-01-01-Orbit-Bridge-Key-Compromise)
