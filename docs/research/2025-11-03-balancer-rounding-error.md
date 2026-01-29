# Balancer V2: The $128M Rounding Error Exploit (November 2025)

On November 3, 2025, **Balancer V2**—one of the largest and most trusted AMMs in DeFi—suffered a catastrophic exploit resulting in the theft of approximately **$128.64 million** across six blockchain networks. The attack exploited a subtle **arithmetic precision loss** in the Composable Stable Pool (CSP) invariant calculations, weaponizing Solidity's integer division rounding to systematically drain liquidity from multiple pools in under 30 minutes.

## Technical Overview
Balancer V2's architecture separates token storage from pool logic through a centralized "Vault" contract. This design enables capital efficiency but creates a shared attack surface when pool mathematics contain vulnerabilities. The exploited CSP implementation used Curve's StableSwap invariant formula to maintain pegs between similar assets.

The vulnerability resided in the **`_upscaleArray`** function, which scales token balances for invariant calculations. When balances reached specific low-value thresholds (8-9 wei), Solidity's integer division introduced significant relative errors that compounded across batched operations.

## Exploit Mechanism: The Precision Death Spiral

### Phase 1: The Rounding Boundary Setup
The attacker targeted Balancer's ComposableStablePool contracts, which rely on the invariant D (total pool value) to determine BPT (Balancer Pool Token) pricing. The formula `BPT Price = D / TotalSupply` becomes vulnerable when D is miscalculated.

The attacker executed large swaps to push one token's balance to the **critical 8-9 wei threshold**. At this scale, integer division rounding errors become disproportionately large relative to the actual value.

### Phase 2: The Precision Accumulation
The critical flaw was in the `_upscaleArray` function:

```solidity
function _upscaleArray(uint256[] memory amounts, uint256[] memory scalingFactors) 
    private pure returns (uint256[] memory) {
    for (uint256 i = 0; i < amounts.length; i++) {
        amounts[i] = FixedPoint.mulDown(amounts[i], scalingFactors[i]);
    }
    return amounts;
}
```

The `mulDown` function performs integer division that **always rounds down**. When balances are in the 8-9 wei range, this rounding can cause **up to 10% precision loss per operation**.

The attacker constructed **batchSwap transactions containing 65+ micro-swaps**. While individual swaps produced negligible precision loss, the cumulative effect across atomic transactions caused:
1. Systematic underestimation of invariant D
2. Artificial suppression of BPT price
3. Massive extraction opportunities

### Phase 3: Value Extraction
With BPT prices artificially suppressed, the attacker executed the final stage:
1. Minted or purchased BPT at the suppressed price
2. Redeemed BPT for underlying assets at full market value
3. Repeated the cycle 65 times within a single transaction

### The Internal Balance Mechanism
Balancer V2's internal balance system became the exfiltration vector:

```solidity
mapping(address => mapping(IERC20 => uint256)) private _internalTokenBalance;
```

The exploit contract accumulated stolen funds in its **internal balance** during the constructor execution. The Vault's accounting system recognized the exploit contract as the owner of these balances without requiring standard ERC20 transfers.

**Stolen Assets (Per InternalBalanceChanged Events):**
- Pool 1 (osETH/wETH-BPT): +4,623 WETH, +6,851 osETH
- Pool 2 (wstETH-WETH-BPT): +1,963 WETH, +4,259 wstETH
- **Total:** 6,586 WETH + 6,851 osETH + 4,259 wstETH

## The Two-Stage Attack Architecture

### Stage 1: Theft (Constructor Execution)
- **Transaction:** `0x6ed07db1a9fe5c0794d44cd36081d6a6df103fab868cdd75d581e3bd23bc9742`
- **Method:** Deploy exploit contract; constructor auto-executes batchSwap operations
- **Result:** $63M drained via rounding error, stored in contract's internal balance

### Stage 2: Extraction (Function Call)
- **Transaction:** `0xd155207261712c35fa3d472ed1e51bfcd816e616dd4f517fa5959836f5b48569`
- **Method:** Call withdrawal function to transfer internal balance
- **Result:** Funds transferred to final recipient address

## Why This Matters (The Micro-Erosion Vector)
The Balancer exploit demonstrates a dangerous class of vulnerability that bypasses traditional auditing:

1. **Cumulative Effect Blindness:** Standard audits verify individual operation correctness but rarely test cumulative effects of adversarial batch operations. A 0.1% error per operation becomes 6.5% error after 65 iterations.

2. **Integer Division Blindspots:** Solidity's integer division is deterministic but often misunderstood. When scaling factors multiply balances to high precision, rounding down creates systematic value leakage.

3. **Shared Liquidity Exposure:** Balancer's Vault architecture meant that a single mathematical flaw in CSPs affected all pools simultaneously, creating a contagion effect.

4. **Atomic Exploitation:** The batchSwap mechanism allowed the attacker to compound errors within a single transaction, preventing any intervention or monitoring systems from reacting.

## Mitigation Strategies

### Immediate Protocol Response
- Disable Composable Stable Pool creation and interaction
- Alert integrators and frontend interfaces
- Coordinate with white-hat hackers for recovery efforts

### Architectural Fixes
- **Rounding Direction Consistency:** Ensure all scaling operations use consistent rounding that doesn't systematically bias the invariant calculation
- **Precision Testing:** Implement invariant tests that verify `D / TotalSupply` remains consistent across edge-case balance values (0-100 wei range)
- **Circuit Breakers:** Add limits on the number of operations within batched transactions that can affect a single pool

### Industry-Wide Lessons
- **Formal Verification:** Mathematical invariants should be formally verified to ensure rounding errors cannot accumulate to economically significant values
- **Economic Attack Modeling:** Beyond code correctness, protocols must model worst-case economic outcomes from adversarial transaction sequencing
- **Continuous Monitoring:** Real-time monitoring systems should flag transactions where invariant calculations produce anomalous results

## Conclusion
The $128M Balancer exploit represents a paradigm shift in smart contract exploitation: **mathematical vulnerabilities weaponized through automation**. Traditional security models that focus on individual function correctness failed to catch this vulnerability because the exploit required understanding how tiny flaws compound across 65+ atomic operations.

The lesson for the industry is clear: **mathematical robustness is as critical as access control**. Protocols must implement rigorous testing that explores the edge cases of their economic models, not just their code logic.
