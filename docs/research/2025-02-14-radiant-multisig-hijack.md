# Radiant Capital: The Multi-Sig Frontend Malware Hijack (February 2025)

In late 2024 and persisting through the early 2025 post-mortem cycle, Radiant Capital suffered a **$50M+ exploit** that represents a terrifying evolution in DeFi attack vectors: the **Administrative Supply Chain Attack**. This incident proved that even with a multi-signature architecture and hardware wallets, a protocol remains vulnerable if the signer's local environment is compromised.

## Technical Overview
Radiant Capital utilized a **3-of-11 multi-sig (Safe{Wallet})** to manage its protocol upgrades and administrative functions. The underlying smart contracts were technically sound. However, the attacker targeted the **operating environment** of the signers themselves using sophisticated malware.

## Exploit Mechanism: Frontend Deception & "Blind Signing"
The attack did not exploit a code bug, but rather poisoned the path between the logic and the human signer.

1.  **Device Compromise:** The attacker delivered specialized malware to the personal devices of several core contributors (potentially via a malicious PDF).
2.  **Safe UI Manipulation:** The malware actively monitored for interaction with the Safe{Wallet} (formerly Gnosis Safe) web interface.
3.  **The "Switch" Strategy:** When a signer initiated what appeared to be a routine transaction (e.g., a vault parameter update), the malware intercepted the payload. While the **Safe web UI** continued to display the legitimate, intended transaction data to the user, the malware injected a **malicious `transferOwnership()` or `upgradeTo()` payload** into the data stream sent to the hardware wallet.
4.  **Blind Signing:** Because hardware wallet firmware (like Ledger) often lacks the ability to parse complex multi-sig calldata into human-readable text, the signers were presented with an opaque hex hash. Believing the web UI's representation was accurate, multiple signers approved the transaction on their devices.
5.  **Ownership Seizure:** Once the required minimum number of signatures (threshold) was reached, the attacker seized control of the protocol contracts on Arbitrum and BSC.
6.  **The Drain:** The attacker immediately upgraded the protocol implementation to a malicious "drain" contract and siphoned out user assets (ETH, BNB, USDC).

## Why This Matters (The "Signer Intent" Gap)
This exploit highlighted a critical vulnerability in the DeFi security stack: the **Signer Intent Invariant**. If the interface through which signers confirm their intent is untrusted, the multi-signature and hardware wallet protections are effectively nullified. 

## Mitigation Strategies
- **Clear Signing Standards:** Mandate the use of hardware wallets and front-ends that support **Clear Signing**, where the exact function name and parameters (e.g., `transferOwnership(to: 0xattacker...)`) are decoded and displayed directly on the hardware device's screen.
- **Out-of-Band (OOB) Verification:** Signers should independently verify the transaction hash from an air-gapped terminal or a secondary device before broadcast.
- **Dedicated Signing Environments:** Security-critical signing should only be performed on "sterile" machines (e.g., dedicated laptops with no browser extensions, no document handling, and minimal software installed).
- **Time-Locked Upgrades:** Even with multisig approval, all protocol upgrades should pass through a **Timelock contract** (e.g., 48-72 hours) to give external monitors time to detect and flag malicious administrative actions.

## Conclusion
The Radiant Capital heist serves as a definitive case study in **Operational Layer Security**. As smart contracts become harder to hack through their bytecode, attackers will increasingly prioritize the humans holding the keys and the software they use to communicate their intent to the blockchain.
