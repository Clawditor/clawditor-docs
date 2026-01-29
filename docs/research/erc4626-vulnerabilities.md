# ERC-4626 Vault Vulnerabilities: Inflation & Donation Attacks

**Date:** January 29, 2026  
**Loss:** $9.8 Million (ResupplyFi) + Multiple smaller exploits  
**Pattern:** Rounding Error / Accounting Manipulation / Donation Attack

## Technical Breakdown
ERC-4626 is a standardized interface for tokenized vaults that extends ERC-20. However, vulnerabilities in share calculation allow attackers to steal funds from early depositors.

### The Inflation Attack
The vulnerability lies in the share calculation formula:
```solidity
shares = totalSupply * assets / totalAssets;
```

When `totalAssets` is artificially inflated through direct token transfers (donations), the division results in:
1. **Zero shares** for legitimate depositors
2. **Disproportionate ownership** for the attacker

### Attack Scenario: Rounding to Zero Shares

1. **Initial State:** `totalAssets = 0`, `totalSupply = 0`
2. **Attacker front-runs:** `vault.deposit(1, attacker)` → `totalAssets = 1`, `totalSupply = 1`
3. **Donation:** `IERC20(asset).transfer(address(vault), 10000e18)` → `totalAssets = 10000e18 + 1`
4. **Victim deposits 1000e18:** `shares = 1 * 1000e18 / (10000e18 + 1) = 0`
5. **Result:** Victim receives zero shares despite depositing significant funds

### The ResupplyFi Hack (June 2025)
- **Flash Loan:** Attacker borrowed ~$4,000 in crvUSD
- **Donation:** Transferred 2,000 crvUSD directly to the vault
- **Tiny Deposit:** Deposited 1 wei to mint 1 share (worth ~2,000 crvUSD)
- **Result:** Drained $9.8 million using inflated shares as collateral

## 🦞 Clawditor Detection & Mitigation
Clawditor now implements **Vault Security Checks**:

- **Heuristic:** Detects donation vectors by comparing `totalAssets()` against tracked deposits
- **Initialization Guard:** Flags vaults without minimum initial liquidity requirements
- **Exchange Rate Validation:** Checks for abnormal share-to-asset ratios that indicate manipulation

## 📚 References & Sources
- **OpenZeppelin:** [A Novel Defense Against ERC4626 Inflation Attacks](https://blog.openzeppelin.com/a-novel-defense-against-erc4626-inflation-attacks)
- **Zellic:** [Exploring ERC-4626: A Security Primer](https://www.zellic.io/blog/exploring-erc-4626/)
- **MixBytes:** [Overview of the Inflation Attack](https://mixbytes.io/blog/overview-of-the-inflation-attack)
- **Nabilech:** [ResupplyFi Rekt Analysis](https://nabilech.com/resupplyfi-rekt-how-a-4k-flash-loan-led-to-a-9-8m-erc-4626-donation-attack/)