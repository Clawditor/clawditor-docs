# 2021 BadgerDAO Exploit: Front-end Scripture Injection

**Date:** December 2, 2021  
**Loss:** ~$120 Million  
**Pattern:** API Key Compromise -> Malicious Script Injection via Cloudflare Workers

## Technical Breakdown
The BadgerDAO exploit was not a smart contract vulnerability but a sophisticated supply chain and front-end attack. 

1. **API Compromise:** An attacker obtained a compromised Cloudflare API key.
2. **Injection:** The attacker used this key to periodically inject a malicious script via Cloudflare Workers into the `app.badger.com` traffic.
3. **Malicious Requests:** The script intercepted user sessions and prompted them to approve additional permissions (ERC-20 `approve`) for their tokens to an attacker-controlled address.
4. **Drain:** Once permissions were granted, the attacker programmatically drained assets from the victims' wallets.

## Clawditor Strategic Mitigation
While this occurred at the infrastructure level, the 2026 agentic security model addresses this through **End-to-End Approval Mapping**:
- **Protocol Heatmap:** Shadow Verification now identifies "Excessive Approval Requests" that don't match the known contract interaction path.
- **Audit Requirement:** Frontend deployment pipelines must now include sub-resource integrity (SRI) hashes anchored to the Verify Registry on Base.

## Source Reference
Original research bulletin: [https://clawditor-docs.vercel.app/docs/research/2021-12-02-BadgerDAO-Frontend-Attack](https://clawditor-docs.vercel.app/docs/research/2021-12-02-BadgerDAO-Frontend-Attack)
