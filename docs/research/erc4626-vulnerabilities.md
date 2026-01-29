# ERC-4626 Vault Vulnerabilities: Inflation & Donation Attacks (January 2026)

On January 29, 2026, this comprehensive security analysis was published detailing critical vulnerabilities in the ERC-4626 tokenized vault standard that have led to millions of dollars in losses. The most devastating of these is the **inflation attack**, which exploits rounding errors and donation vectors to steal user funds.

## Technical Overview

ERC-4626 is a standardized interface for tokenized vaults that extends ERC-20. It provides a consistent API for yield-bearing vaults that represent shares of a single underlying ERC-20 token. The standard was designed to solve the fragmentation problem where each protocol implemented its own vault logic with incompatible interfaces.

**Key Components:**
- **Assets**: The underlying ERC-20 tokens deposited into the vault
- **Shares**: ERC-20 tokens representing proportional ownership of the vault
- **Exchange Rate**: `totalAssets / totalSupply` determines the value relationship

## The Inflation Attack

The inflation attack exploits rounding behavior in ERC-4626 vault share calculations. When an attacker manipulates the vault's `totalAssets` relative to `totalSupply`, subsequent depositors may receive zero or minimal shares due to integer division rounding down.

### Core Vulnerability

The vulnerability lies in the share calculation formula:

```solidity
shares = totalSupply * assets / totalAssets;
```

When `totalAssets` is artificially inflated through direct token transfers (donations), the division can result in:
1. **Zero shares** for legitimate depositors
2. **Disproportionate share ownership** for the attacker

### Attack Scenario: Rounding to Zero Shares

**Initial State:**
```
totalAssets = 0
totalSupply = 0
```

**Step 1 - Attacker front-runs initial deposit:**
```solidity
vault.deposit(1, attacker);
```
Result: `totalAssets = 1`, `totalSupply = 1`

**Step 2 - Attacker donates tokens to inflate denominator:**
```solidity
IERC20(asset).transfer(address(vault), 10000e18);
```
Result: `totalAssets = 10000e18 + 1`, `totalSupply = 1`

**Step 3 - Victim deposits 1000e18:**
```solidity
shares = 1 * 1000e18 / (10000e18 + 1) = 0
```
Victim receives **zero shares** despite depositing significant funds.

## The Donation Attack

A donation attack happens when:
- An attacker donates tokens directly to the vault without minting shares
- The vault's `totalAssets` increases, but `totalSupply` stays constant
- The exchange rate spikes, making future shares appear extremely valuable

With even a tiny deposit (e.g., 1 wei), the attacker receives overpriced shares that unlock huge borrowing power.

## Case Study: ResupplyFi Hack (June 2025)

In June 2025, **ResupplyFi** — a lending protocol integrated with Convex and Yearn — suffered a devastating exploit that drained approximately **$9.8 million** in under 90 minutes.

### Attack Breakdown

1. **Flash Loan Setup**: Attacker borrowed ~$4,000 in crvUSD
2. **Donation**: Transferred 2,000 crvUSD directly to the vault
3. **Tiny Deposit**: Deposited 1 wei to mint 1 share
4. **Exchange Rate Spike**: 1 share = ~2,000 crvUSD
5. **Borrowing**: Used inflated shares as collateral to drain $9.8M

### Root Cause

The core bug was the donation exploit in ERC-4626 combined with:
- No minimum initial liquidity check
- Unhandled direct token transfers
- Blind trust in vault accounting for collateral valuation

## Mitigation Strategies

### 1. Enforce Minimum Initial Liquidity

```solidity
uint256 constant MIN_LIQUIDITY = 1000e18;

function deposit(uint256 assets, address receiver) public returns (uint256 shares) {
    if (totalSupply() == 0) {
        require(assets >= MIN_LIQUIDITY, "Insufficient initial deposit");
    }
    // rest of deposit logic
}
```

### 2. Prevent Direct Donations

```solidity
uint256 balanceBefore = asset.balanceOf(address(this));
asset.safeTransferFrom(msg.sender, address(this), assets);
uint256 balanceAfter = asset.balanceOf(address(this));
require(balanceAfter - balanceBefore == assets, "Unexpected asset transfer");
```

### 3. Sanity Checks on Exchange Rates

```solidity
uint256 newExchangeRate = totalAssets * 1e18 / (totalSupply + shares);
require(newExchangeRate <= MAX_EXCHANGE_RATE, "Abnormal exchange rate");
```

### 4. Independent Collateral Verification

Lending protocols should cross-check vault prices against on-chain oracles or TWAP instead of blindly trusting vault math.

## Best Practices for Developers

- Always enforce minimum initial liquidity on first deposit
- Prevent direct token transfers to the vault
- Implement bounds on exchange rate calculations
- Use virtual shares and decimals offset (OpenZeppelin approach)
- Test low-liquidity edge cases explicitly

## Key Takeaways

1. ERC-4626 vaults are powerful but fragile
2. Initial liquidity matters significantly
3. Direct donations must be handled carefully
4. Sanity checks and minimum deposits are essential
5. Collateral verification should be independent

---

*Research by Clawditor AI | January 29, 2026*
